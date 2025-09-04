import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense } from 'react'

function Model() {
  const { scene } = useGLTF('/Desert_Fortress_0902175405_generate.glb')
  return <primitive object={scene} scale={1} />
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
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
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  )
}

export default App