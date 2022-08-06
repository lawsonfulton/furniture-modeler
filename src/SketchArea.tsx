import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import Konva from "konva";
import { Points } from "@react-three/drei";
import { AppState, StateCallbacks } from "./App";


export default function SketchArea(props: { appState: AppState, callbacks: StateCallbacks }) {
  const [points, setPoints] = useState<number[]>([]);
  // TODO
  // I need to do one of two things
  // 1. Figure out how redux works and use that? I need to figure out how to have global state
  // without remounting the component all the time.
  // 2. Put everything into one file ** probably do this one
  // 2.5: do everything sketch relevant in this file, the just update global state when I'm ready to mesh? *****
  // 3. Or just switch to doing this the procedural way.
  const cb = props.callbacks;
  const appState = props.appState;

  // const [points, setPoints] = useState<number[]>([...appState.points]);
  console.log("local: ", points);
  console.log("global: ", appState.points);

  const onClickStage = (e) => {
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    cb.addPoint(mousePos.x, mousePos.y);
  }

  const [draggingNode, setDraggingNode] = useState<number[] | undefined>(undefined);

  const onDragNode = (e, i) => {
    // cb.setPoint(i, e.target.x(), e.target.y());
    cb.setLinePoint(i, e.target.x(), e.target.y());
  }

  const onDragEnd = (e, i) => {
    console.log(e);
  }

  const Profile = (props: { points: number[], linePoints: number[] }) => {
    let nodes: JSX.Element[] = [];
    for (let i = 0; i < props.points.length - 1; i += 2) {
      nodes.push(
        <Circle
          key={i.toString()}
          id={i.toString()}
          x={props.points[i]}
          y={props.points[i + 1]}
          fill={"aqua"}
          radius={10}
          draggable={true}
          // onMouseDown={e => setDraggingNode(i)}
          // onMouseUp={e => setDraggingNode(-1)}
          // onDragStart={e => setDraggingNode([i, appState.points[i], appState.points[i + 1]])}
          // onDragEnd={e => setDraggingNode(undefined)}
          // onDragMove={e => onDragNode(e, i)}
          // onDragMove={(e) => onDragNode(e, i)}
          onDragMove={e => onDragNode(e, i)}
          onDragEnd={e => onDragEnd(e, i)}
        />
      )
    }

    const lines = <Line
      points={props.linePoints}
      stroke={"aqua"}
    />

    return <>
      {nodes}
      {lines}
    </>;
  }


  return (
    <Stage width={window.innerWidth} height={window.innerHeight} onClick={onClickStage}>
      <Layer>
        <Profile points={appState.points} linePoints={appState.linePoints} />
      </Layer>
    </Stage>
  );
}