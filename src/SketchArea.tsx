import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Group, Arc } from "react-konva";
import Konva from "konva";
import { Points } from "@react-three/drei";
import { Tool } from "./App";
import RadiusPicker from "./RadiusPicker";
import Solver from "./ConstraintSolver";
import { Vector2 } from "three";
// import { Constraint, FixedPoint, LineSegment, LinesIncident, Point } from "./Constraints";


class NodeData {
  points: number[] = [];
  cornerRadii: number[] = [];
}

interface SketchAreaProps {
  activeTool: Tool;
}

export default function SketchArea(props: SketchAreaProps) {
  const [nodeData, setNodeData] = useState<NodeData>(new NodeData());

  {
    let vars = [1, 2, 3, 4, 5, 6, 7, 8]

    let points: Point[] = [];
    for (let i = 0; i < vars.length - 1; i += 2) {
      points.push(new Point(i, i + 1));
    }
    console.log(points)
    const lines = [
      new LineSegment(points[0], points[1]),
      new LineSegment(points[2], points[3]),
    ]

    const constraints: Constraint[] = [
      new FixedPoint(points[0], 0, 0),
      new FixedPoint(points[3], 10, 10),
      new LinesIncident(lines[0], lines[1])
    ];
    console.log("constraints[0] value =", constraints[0].value(vars));
    const grad0 = Array(vars.length).fill(0);
    constraints[0].gradient(vars, grad0);
    console.log("constraints[0] grad =", grad0);

    console.log("constraints[1] value =", constraints[1].value(vars));
    const grad1 = Array(vars.length).fill(0);
    constraints[1].gradient(vars, grad1);
    console.log("constraints[1] grad =", grad1);

    console.log("constraints[2] value =", constraints[2].value(vars));
    const grad2 = Array(vars.length).fill(0);
    constraints[2].gradient(vars, grad2);
    console.log("constraints[2] grad =", grad2);

    const solver = new Solver(vars.length, constraints);
    const sol = solver.solve(vars);
    console.log("sol", sol);
  }
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
          key={"node-" + i.toString()}
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

  // Render the nodes and lines
  const Arcs = (props: { nodeData: NodeData, activeTool: Tool }) => {
    let arcs: JSX.Element[] = [];
    for (let i = 0; i < props.nodeData.cornerRadii.length; i += 1) {
      if (props.nodeData.cornerRadii[i] > 0) {
        arcs.push(
          <Arc
            key={"arc-" + i.toString()}
            x={props.nodeData.points[i * 2]}
            y={props.nodeData.points[i * 2 + 1]}
            angle={45}
            innerRadius={props.nodeData.cornerRadii[i]}
            outerRadius={props.nodeData.cornerRadii[i]}
            strokeEnabled={true}
            stroke="black" />
        )
      }
    }

    return <>
      {arcs}
    </>;
  }

  const Profile2D = (props: { nodeData: NodeData, activeTool: Tool }) => {
    return <>
      <Line
        points={props.nodeData.points}
        stroke={"#1c1c1cff"}
      />
      <Nodes nodeData={props.nodeData} activeTool={props.activeTool} />
      <Arcs nodeData={props.nodeData} activeTool={props.activeTool} />
    </>
  };


  const RadiusPickerWrapper = (props: { nodeIndex: number | undefined, nodeData: NodeData }) => {
    if (props.nodeIndex === undefined) {
      return <></>;
    } else {
      return <RadiusPicker
        x={props.nodeData.points[props.nodeIndex * 2]}
        y={props.nodeData.points[props.nodeIndex * 2 + 1]}
        maxRadius={100}
        onSetRadius={radius => {
          setRadius(props.nodeIndex!, radius);
          setSettingNodeRadIndex(undefined);
        }} />
    }
  }

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} onClick={onClickStage}>
      <Layer>
        <RadiusPickerWrapper nodeIndex={settingNodeRadIndex} nodeData={nodeData} />
        <Profile2D nodeData={nodeData} activeTool={props.activeTool} />
      </Layer>
    </Stage>
  );
}