import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line } from "react-konva";
import Konva from "konva";
import { Points } from "@react-three/drei";

class ColoredRect extends React.Component {
  state = {
    color: "green"
  };
  handleClick = () => {
    this.setState({
      color: Konva.Util.getRandomColor()
    });
  };
  render() {
    return (
      <Rect
        x={20}
        y={20}
        width={50}
        height={50}
        fill={this.state.color}
        shadowBlur={5}
        onClick={this.handleClick}
      />
    );
  }
}



export default function SketchArea() {
  const [points, setPoints] = useState<number[]>([]);

  const onClickStage = (e) => {
    const stage = e.currentTarget;
    const pos = stage.getPointerPosition();
    setPoints(points.concat([pos.x, pos.y]))
  }

  const onDragNode = (e, i) => {
    points[i] = e.target.x();
    points[i + 1] = e.target.y();
    setPoints(points);
  }

  const Profile = (props: { points: number[] }) => {
    let nodes: JSX.Element[] = [];
    for (let i = 0; i < props.points.length - 1; i += 2) {
      nodes.push(
        <Circle
          key={i}
          x={props.points[i]}
          y={props.points[i + 1]}
          fill={"aqua"}
          radius={5}
          draggable={true}
          onDragMove={(e) => onDragNode(e, i)}
        />
      )
    }

    const lines = <Line
      points={props.points}
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
        <Profile points={points} />
      </Layer>
    </Stage>
  );
}