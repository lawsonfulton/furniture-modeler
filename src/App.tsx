import { Canvas } from "@react-three/fiber";
import React from "react";

const App = () => {
  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
            <meshNormalMaterial attach="material" />
          </mesh>
        </Canvas>
      </div>
    </>
  );
};

export default App;
