import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Group } from "react-konva";
import Konva from "konva";
import { Points } from "@react-three/drei";
import { Tool } from "./App";


class NodeData {
  points: number[] = [];
  cornerRadii: number[] = [];
}

interface RadiusSetterToolProps {
  x: number;
  y: number;
  maxRadius: number;
  onSetRadius: (radius: number) => void;
}

const RadiusSetterTool = (props: RadiusSetterToolProps) => {
  const [radius, setRadius] = useState(0);

  const onMouseMove = e => {
    const stage = e.target.getStage();
    const mousePos = stage!.getPointerPosition();
    const mx = mousePos!.x;
    const my = mousePos!.y;
    const dist = Math.sqrt((mx - props.x) ** 2 + (my - props.y) ** 2);
    if (dist < props.maxRadius) {
      setRadius(dist);
    }
  };

  return (<>
    <Circle
      x={props.x}
      y={props.y}
      strokeEnabled={true}
      stroke="black"
      dash={[5, 5]}
      radius={radius}
      draggable={true} />

    {/* Invisible larger circle to capture move events */}
    <Circle
      x={props.x}
      y={props.y}
      radius={props.maxRadius * 2}
      onMouseMove={onMouseMove}
      onMouseDown={e => props.onSetRadius(radius)}
    />
  </>
  );
};


interface SketchAreaProps {
  activeTool: Tool;
}

export default function SketchArea(props: SketchAreaProps) {
  const [nodeData, setNodeData] = useState<NodeData>(new NodeData());

  // Index of node whose radius is being set
  const [settingNodeRadIndex, setSettingNodeRadIndex] = useState<number | undefined>(undefined);

  // Mutate State Functions
  const addPoint = (x: number, y: number) => {
    console.log("addPoint(", x, ", ", y, ")");
    setNodeData(nodeData => {
      return {
        ...nodeData,
        points: [...nodeData.points, x, y],
        cornerRadii: [...nodeData.cornerRadii, 0],
      };
    });
  }

  const setPoint = (nodeIndex: number, x: number, y: number) => {
    setNodeData(nodeData => {
      const newPoints = [...nodeData.points];
      newPoints[nodeIndex * 2] = x;
      newPoints[nodeIndex * 2 + 1] = y;
      return {
        ...nodeData,
        points: newPoints,
      };
    });
  };

  const setRadius = (nodeIndex: number, radius: number) => {
    setNodeData(nodeData => {
      const newRadii = [...nodeData.cornerRadii];
      newRadii[nodeIndex] = radius;
      return {
        ...nodeData,
        cornerRadii: newRadii,
      };
    });
  };

  const setPointDirect = (i: number, x: number, y: number) => {
    nodeData.points[i * 2] = x;
    nodeData.points[i * 2 + 1] = y;
  };


  // Event Handlers
  const onClickStage = (e) => {
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    if (props.activeTool === Tool.Polygon) {
      addPoint(mousePos.x, mousePos.y);
    }
  };

  const onDragNode = (e, i) => {
    // Update points array directly while dragging
    // Calling setState forces a redraw which interrupts the
    // dragging event handler. Not sure what the best way to
    // get around this is.
    setPointDirect(i, e.target.x(), e.target.y());
  };

  const onDragNodeEnd = (e, i) => {
    // When done dragging trigger the state update.
    setPoint(i, e.target.x(), e.target.y());
  };

  const onMouseOverNode = e => {
    document.body.style.cursor = 'pointer';
    e.target.scaleX(1.2);
    e.target.scaleY(1.2);
  };

  const onMouseOutNode = e => {
    document.body.style.cursor = 'default';
    e.target.scaleX(1.0);
    e.target.scaleY(1.0);
  };

  const onClickNode = (e, i) => {
    if (props.activeTool === Tool.Radius) {
      console.log("Choosing radius for node ", i);
      setSettingNodeRadIndex(i);
    }
  }

  // Render the nodes and lines
  const Nodes = (props: { nodeData: NodeData, activeTool: Tool }) => {
    let nodes: JSX.Element[] = [];
    for (let i = 0; i < props.nodeData.cornerRadii.length; i += 1) {
      nodes.push(
        <Circle
          key={i.toString()}
          id={i.toString()}
          x={props.nodeData.points[i * 2]}
          y={props.nodeData.points[i * 2 + 1]}
          fill={"#272727ff"}
          radius={5}
          draggable={props.activeTool === Tool.Polygon}
          onDragMove={e => onDragNode(e, i)}
          onDragEnd={e => onDragNodeEnd(e, i)}
          onMouseOver={e => onMouseOverNode(e)}
          onMouseOut={e => onMouseOutNode(e)}
          onClick={e => onClickNode(e, i)}
        />)
    }
    return <>
      {nodes}
    </>;
  }

  const RadiusSetter = (props: { nodeIndex: number | undefined }) => {
    console.log(props.nodeIndex);

    if (props.nodeIndex === undefined) {
      return <></>;
    } else {
      return <RadiusSetterTool
        x={nodeData.points[props.nodeIndex * 2]}
        y={nodeData.points[props.nodeIndex * 2 + 1]}
        maxRadius={100}
        onSetRadius={radius => {
          setRadius(props.nodeIndex!, radius);
          setSettingNodeRadIndex(undefined);
        }} />
    }
  }

  const Profile2D = (props: { nodeData: NodeData, activeTool: Tool }) => {
    return <>
      <Line
        points={props.nodeData.points}
        stroke={"#1c1c1cff"}
      />
      <Nodes nodeData={props.nodeData} activeTool={props.activeTool} />
    </>
  };


  return (
    <Stage width={window.innerWidth} height={window.innerHeight} onClick={onClickStage}>
      <Layer>
        <RadiusSetter nodeIndex={settingNodeRadIndex} />
        <Profile2D nodeData={nodeData} activeTool={props.activeTool} />
      </Layer>
    </Stage>
  );
}