import React, { useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Extrude, OrbitControls, Center, Line, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import { Geometry } from "./GeometryElements";



interface BlockProps {
  elements: Geometry.Element[];
  state: number[];
}

function Block(props) {
  const extrudeSettings = { steps: 5, depth: 5, bevelEnabled: false };
  const shapes = [new THREE.Shape()];
  for (let i = 0; i < props.elements.length; i++) {
    const element = props.elements[i];

    let shape = new THREE.Shape();
    if (element instanceof Geometry.LineSegment) {
      const line = element as Geometry.LineSegment;
      shape.moveTo(line.x1(props.state) * 1, line.y1(props.state) * 1);
      shape.lineTo(line.x2(props.state) * 1, line.y2(props.state) * 1);
    }
    if (element instanceof Geometry.Arc) {
      const arc = element as Geometry.Arc;
      shape.absarc(arc.x(props.state) * 1,
        arc.y(props.state) * 1,
        arc.radius(props.state) * 1,
        arc.startAngle(props.state) * 1,
        arc.endAngle(props.state) * 1,
        false);
    }
    shapes.push(shape);
  }

  return (
    <>
      <Extrude args={[shapes, extrudeSettings]} {...props}>
        <meshPhysicalMaterial
          flatShading
          color="#3E64FF"
          // thickness={SIDE}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={1}
          // transmission={0.8}
          // ior={1.25}
          attenuationDistance={0}
        />
      </Extrude>
    </>
  );
}

interface Viewer3DProps {
  elements: Geometry.Element[];
  state: number[];
}

export default function Viewer3D(props: Viewer3DProps) {
  console.log("viewer");
  return (
    <Canvas
      dpr={window.devicePixelRatio}
      camera={{ position: new THREE.Vector3(8, 5, 40) }}
    >
      <ambientLight />
      <color attach="background" args={["white"]} />
      <pointLight position={[-20, 10, 25]} />
      <gridHelper
        args={[100, 20, "#4D089A", "#4D089A"]}
        position={[0, 0, -10]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <Center>
        <Block elements={props.elements} state={props.state} />
      </Center>
      <OrbitControls />
    </Canvas >
  );
}