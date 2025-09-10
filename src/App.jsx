import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'

function Model() {
  const [loadError, setLoadError] = useState(false)
  
  const { scene } = useGLTF('https://h2dtjlpgvx.ufs.sh/f/qM02Ejw6Lrz3vYiv3c5Skma785l6VbX29KeWRFrQzuCyGcjH', (loader) => {
    loader.onError = (error) => {
      console.error('GLB Loading Error:', error)
      console.error('Failed to load GLB from UploadThing. Check if the file exists and is accessible.')
      setLoadError(true)
    }
  })
  
  if (loadError) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      </group>
    )
  }
  
  return <primitive object={scene} scale={1} />
}

// Simple character component (you can replace this with a GLB character later)
function Character({ position, color = '#ff6b6b', isClickable = false, onHover, onLeave, onClick }) {
  const meshRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current && !isHovered) {
      // Simple walking animation - bobbing up and down
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1
      // Rotate slightly as if walking
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  const handlePointerOver = () => {
    if (isClickable) {
      setIsHovered(true)
      onHover?.()
    }
  }

  const handlePointerOut = () => {
    if (isClickable) {
      setIsHovered(false)
      onLeave?.()
    }
  }

  const handleClick = () => {
    if (isClickable) {
      onClick?.()
    }
  }

  return (
    <group position={position}>
      {/* Simple character made of basic shapes */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        <boxGeometry args={[0.5, 1.5, 0.3]} />
        <meshStandardMaterial
          color={isHovered ? '#ff9999' : color}
          emissive={isHovered ? '#ff4444' : ''}
          emissiveIntensity={isHovered ? 0.2 : 0}
        />
      </mesh>
      {/* Head */}
      <mesh
        position={[0, 1, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        style={{ cursor: isClickable ? 'pointer' : 'default' }}
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial
          color="#ffdbac"
          emissive={isHovered ? '#ffcc99' : ''}
          emissiveIntensity={isHovered ? 0.1 : 0}
        />
      </mesh>
      {/* Hover indicator */}
      {isHovered && (
        <mesh position={[0, 2.5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Walking characters component
function WalkingCharacters({ onRedCharacterClick }) {
  const characters = [
    { position: [0, 0, 3], color: '#ff6b6b', isClickable: true }, // red
    { position: [3, 0, -9], color: '#4ecdc4', isClickable: false }, // teal
    { position: [10, 0, -5], color: '#45b7d1', isClickable: false }, // blue
    { position: [-3, 0, -20], color: '#96ceb4', isClickable: false }, // green
    { position: [8, 0, -14.5], color: '#feca57', isClickable: false }, // yellow
  ]

  return (
    <>
      {characters.map((char, index) => (
        <Character
          key={index}
          position={char.position}
          color={char.color}
          isClickable={char.isClickable}
          onClick={char.isClickable ? onRedCharacterClick : undefined}
        />
      ))}
    </>
  )
}

function CameraTracker({ onPositionChange }) {
  const { camera } = useThree()

  useFrame(() => {
    onPositionChange([
      Math.round(camera.position.x * 100) / 100,
      Math.round(camera.position.y * 100) / 100,
      Math.round(camera.position.z * 100) / 100
    ])
  })

  return null
}

function App() {
  const [cameraPosition, setCameraPosition] = useState([0, 200, 0])
  const [showDialog, setShowDialog] = useState(false)

  const handleRedCharacterClick = () => {
    setShowDialog(true)
  }

  const closeDialog = () => {
    setShowDialog(false)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [-30.15, 14.05, 23.16], fov: 75 }}>
        {/* Ambient light for overall illumination */}
        <ambientLight intensity={0.4} />

        {/* Main directional light */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Fill light from the opposite side */}
        <directionalLight
          position={[-10, 5, -5]}
          intensity={0.6}
          color="#ffffff"
        />

        {/* Rim light for better definition */}
        <directionalLight
          position={[0, 10, -10]}
          intensity={0.8}
          color="#ffffff"
        />

        {/* Point light for additional detail */}
        <pointLight
          position={[5, 5, 5]}
          intensity={0.5}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Model />
          <WalkingCharacters onRedCharacterClick={handleRedCharacterClick} />
        </Suspense>
        <CameraTracker onPositionChange={setCameraPosition} />
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={50}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          onChange={(e) => {
            const camera = e.target.object
            if (camera.position.y < 5) {
              camera.position.y = 5
              camera.updateProjectionMatrix()
            }
          }}
        />
      </Canvas>

      {/* Camera position display outside Canvas */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <div>Camera Position:</div>
        <div>X: {cameraPosition[0]}</div>
        <div>Y: {cameraPosition[1]}</div>
        <div>Z: {cameraPosition[2]}</div>
      </div>

      {/* Dialog for Mr. Red */}
      {showDialog && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '500px',
          width: '90%',
          zIndex: 2000,
          border: '2px solid #ff6b6b',
          boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              color: '#ff6b6b',
              margin: 0,
              fontSize: '24px',
              textShadow: '0 0 10px rgba(255, 107, 107, 0.5)'
            }}>
              Mr. Red's Story
            </h2>
            <button
              onClick={closeDialog}
              style={{
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
            <p style={{ marginBottom: '15px' }}>
              "Greetings, traveler! I'm Mr. Red, the keeper of this ancient city's secrets.
              I've walked these streets for over 50 years, watching as the city grew from
              a small settlement into the bustling metropolis you see today."
            </p>

            <p style={{ marginBottom: '15px' }}>
              "My story began when I was just a young merchant, carrying goods between
              the distant lands. I've seen empires rise and fall, witnessed the great
              fire of '73 that nearly destroyed our beloved city, and helped rebuild
              it brick by brick with my own hands."
            </p>

            <p style={{ marginBottom: '15px' }}>
              "Now I spend my days wandering these familiar streets, sharing tales with
              anyone who will listen. Each building here holds a memory, each corner
              tells a story. The city is not just stone and mortar - it's alive with
              the dreams and struggles of all who have called it home."
            </p>

            <p style={{
              fontStyle: 'italic',
              color: '#ffcc99',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              "Would you like to hear more about the great market square, or perhaps
              the mysterious tower that appeared overnight?"
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App