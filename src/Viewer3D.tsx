import React, { useRef, useState } from "react";
import * as THREE from "three";
import { Vector3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Extrude, OrbitControls, Center, Line, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Line2 } from "three/examples/jsm/lines/Line2"


import { ReactThreeFiber, extend } from '@react-three/fiber'

extend({ Line_: THREE.Line })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<THREE.Line, typeof THREE.Line>
    }
  }
}



const extrudeSettings = { steps: 2, depth: 10, bevelEnabled: false };
const SIDE = 10;

function Block(props) {
  const shape = React.useMemo(() => {
    const _shape = new THREE.Shape();

    _shape.moveTo(0, 0);
    _shape.lineTo(SIDE, 0);
    _shape.lineTo(SIDE, SIDE * 2);
    _shape.lineTo(0, SIDE * 2);
    _shape.lineTo(0, SIDE * 3);
    _shape.lineTo(-SIDE, SIDE * 3);
    _shape.lineTo(-SIDE, SIDE);
    _shape.lineTo(0, SIDE);

    return _shape;
  }, []);

  return (
    <>
      <Extrude args={[shape, extrudeSettings]} {...props}>
        <meshPhysicalMaterial
          flatShading
          color="#3E64FF"
          thickness={SIDE}
          roughness={0.4}
          clearcoat={1}
          clearcoatRoughness={1}
          transmission={0.8}
          ior={1.25}
          attenuationDistance={0}
        />
      </Extrude>
    </>
  );
}


type SketchPlaneProps = {
  points: Vector3[]
}
function SketchPlane({ points }: SketchPlaneProps) {
  console.log(points);
  if (points.length === 0) {
    return (<></>);
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const ref = useRef<THREE.Line>(null)
  useFrame(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints(points);
    }
  })
  return (
    <line_ ref={ref} geometry={lineGeometry}>
      <lineBasicMaterial attach="material" color={'black'} linewidth={1000} linecap={'round'} linejoin={'round'} />
    </line_>
  )

  // return (
  //   <>
  //     <Line
  //       points={points}
  //       color={"black"}
  //       lineWidth={10}
  //       dashed={false}
  //     />
  //   </>
  // );
}

export default function Viewer3D() {

  return (
    <Canvas
      dpr={window.devicePixelRatio}
      camera={{ position: new THREE.Vector3(8, 5, 40) }}
    >
      {/* <OrthographicCamera makeDefault zoom={1} position={[0, 0, 100]} /> */}

      <ambientLight />
      {/* <pointLight position={[10, 10, 10]} /> */}


      <color attach="background" args={["#06092c"]} />
      <pointLight position={[-20, 10, 25]} />
      <gridHelper
        args={[100, 20, "#4D089A", "#4D089A"]}
        position={[0, 0, -10]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <Center>
        <Block />
      </Center>
      <OrbitControls autoRotate autoRotateSpeed={5} />
    </Canvas >
  );
}