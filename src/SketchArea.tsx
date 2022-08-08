import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Group, Arc } from "react-konva";
import Konva from "konva";
import { Points } from "@react-three/drei";
import { Tool } from "./App";
import RadiusPicker from "./RadiusPicker";
import Solver from "./ConstraintSolver";
import { Vector2 } from "three";
import { Geometry } from "./GeometryElements";
import { GeometrySystem } from "./GeometrySystem";
import { Constraint } from "./Constraints";
// import { Constraint, FixedPoint, LineSegment, LinesIncident, Point } from "./Constraints";


class NodeData {
  points: number[] = [];
  cornerRadii: number[] = [];
}

class SketchState {
  lineSegments: Geometry.LineSegment[] = [];
  arcs: Geometry.Arc[] = [];
  constraints: Constraint[] = [];

  // Every element must be registed with the geometry system
  geometrySystem: GeometrySystem = new GeometrySystem();
}

interface SketchAreaProps {
  activeTool: Tool;
}

export default function SketchArea(props: SketchAreaProps) {
  // const [nodeData, setNodeData] = useState<NodeData>(new NodeData());
  const [sketchState, setSketchState] = useState<SketchState>(new SketchState());
  const [prevPathPoint, setPrevPathPoint] = useState<Vector2 | undefined>(undefined);

  // Index of node whose radius is being set
  const [settingNodeRadIndex, setSettingNodeRadIndex] = useState<number | undefined>(undefined);

  // Mutate State Functions
  // const createLineSegment = (p1: Vector2, p2: Vector2) => {
  //   setGeometry((geometry): GeometrySystem => {
  //     let newGeometry = geometry.shallowCopy();
  //     newGeometry.addLineSegment(p1, p2);
  //     return newGeometry;
  //   });
  // }

  // const addPoint = (x: number, y: number) => {
  //   console.log("addPoint(", x, ", ", y, ")");
  //   setNodeData(nodeData => {
  //     return {
  //       ...nodeData,
  //       points: [...nodeData.points, x, y],
  //       cornerRadii: [...nodeData.cornerRadii, 0],
  //     };
  //   });
  // }

  // const setPoint = (nodeIndex: number, x: number, y: number) => {
  //   setNodeData(nodeData => {
  //     const newPoints = [...nodeData.points];
  //     newPoints[nodeIndex * 2] = x;
  //     newPoints[nodeIndex * 2 + 1] = y;
  //     return {
  //       ...nodeData,
  //       points: newPoints,
  //     };
  //   });
  // };

  // const setRadius = (nodeIndex: number, radius: number) => {
  //   setNodeData(nodeData => {
  //     const newRadii = [...nodeData.cornerRadii];
  //     newRadii[nodeIndex] = radius;
  //     return {
  //       ...nodeData,
  //       cornerRadii: newRadii,
  //     };
  //   });
  // };

  // const setPointDirect = (i: number, x: number, y: number) => {
  //   nodeData.points[i * 2] = x;
  //   nodeData.points[i * 2 + 1] = y;
  // };

  // const addLineSegment = (lineSeg: Geometry.LineSegment) => {
  //   let geoSystem = sketchState.geometrySystem.shallowCopy();
  //   geoSystem.addElement(lineSeg);
  //   setSketchState(sketchState => {
  //     return { ...sketchState, lineSegments: [...sketchState.lineSegments, lineSeg] }
  //   });
  // }

  const addPointToPath = (x: number, y: number) => {
    if (prevPathPoint) {
      // Need to make a shallow copy for react
      let geoSystem = sketchState.geometrySystem.shallowCopy();

      // Create / register our line segment
      const lineSeg = geoSystem.addLineSegment(prevPathPoint.x, prevPathPoint.y, x, y);

      setSketchState(sketchState => {
        return {
          ...sketchState,
          lineSegments: [...sketchState.lineSegments, lineSeg],
          geometrySystem: geoSystem
        };
      });
    }

    setPrevPathPoint(new Vector2(x, y));
  }

  // Event Handlers
  const onClickStage = (e) => {
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    if (props.activeTool === Tool.Polygon) {
      addPointToPath(mousePos.x, mousePos.y);
    }
  };

  const onDragNode = (e, lineIndex: number, linePoint: number) => {
    // Update points array directly while dragging
    // Calling setState forces a redraw which interrupts the
    // dragging event handler. So skipping this for the time being.
    
    // setSketchState(sketchState => {
    //   const state = sketchState.geometrySystem.state;
    //   const newSketchState = { ...sketchState };
    //   newSketchState.lineSegments[lineIndex].set(state, linePoint, e.target.x(), e.target.y());
    //   return newSketchState;
    // });
  };
  
  const updateLineSegments = (e, lineIndex1: number, linePoint1: number, lineIndex2: number | undefined, linePoint2: number | undefined) => {
    // When done dragging trigger the state update.
    setSketchState(sketchState => {
      const state = sketchState.geometrySystem.state;
      const newSketchState = { ...sketchState };
      newSketchState.lineSegments[lineIndex1].set(state, linePoint1, e.target.x(), e.target.y());
      if(lineIndex2 !== undefined && linePoint2 !== undefined && lineIndex2 >= 0) {
        newSketchState.lineSegments[lineIndex2].set(state, linePoint2, e.target.x(), e.target.y());
      }
      return newSketchState;
    });
  };

  const magnifyNode = e => {
    document.body.style.cursor = 'pointer';
    e.target.scaleX(1.2);
    e.target.scaleY(1.2);
  };

  const resetNode = e => {
    document.body.style.cursor = 'default';
    e.target.scaleX(1.0);
    e.target.scaleY(1.0);
  };

  const addArc = (e, line1: number, point1:number, line2: number | undefined, point2: number | undefined) => {
    if (props.activeTool === Tool.Radius && sketchState.lineSegments.length > 0 && line1 > 0) {
      // console.log("Choosing radius for node ", i);
      // setSettingNodeRadIndex(i);

      // Need to make a shallow copy for react
      let geoSystem = sketchState.geometrySystem.shallowCopy();
      const state = geoSystem.state;
      
      const radius = 50;
      const x = sketchState.lineSegments[line1].x(state, point1);
      const y = sketchState.lineSegments[line1].y(state, point1);
      const startAngle = 90 * Math.PI / 180;
      const endAngle = 135 * Math.PI / 180;
      const arc = geoSystem.addArc(x, y, radius, startAngle, endAngle);

      setSketchState(sketchState => {
        return {
          ...sketchState,
          arcs: [...sketchState.arcs, arc],
          geometrySystem: geoSystem
        };
      }); 
    }
  }

  // Render the nodes and lines
  const Nodes = (props: { lineSegments: Geometry.LineSegment[], activeTool: Tool, geoState: number[] }) => {
    const fill = "#272727ff";
    const radius = 5;

    let nodes: JSX.Element[] = [];
    for (let i = 0; i < props.lineSegments.length; i += 1) {
        const prevLine = i > 0 ? i - 1 : undefined;
        nodes.push(
          <Circle
          key={"node-" + i.toString() + "-0"}
          x={props.lineSegments[i].x1(props.geoState)}
          y={props.lineSegments[i].y1(props.geoState)}
          fill={fill}
          radius={radius}
          draggable={props.activeTool === Tool.Polygon}
          onDragEnd={e => updateLineSegments(e, i, 0, prevLine, 1)}
          onMouseOver={e => magnifyNode(e)}
          onMouseOut={e => resetNode(e)}
          onClick={e => addArc(e, i, 0, prevLine, 1)}
          // onDragMove={e => onDragNode(e, lineIndex, linePoint)}
        />);

        if(i === props.lineSegments.length - 1) { // Add the last node
          nodes.push(
            <Circle
            key={"node-" + i.toString() + "-1"}
            x={props.lineSegments[i].x2(props.geoState)}
            y={props.lineSegments[i].y2(props.geoState)}
            fill={fill}
            radius={radius}
            draggable={props.activeTool === Tool.Polygon}
            onDragEnd={e => updateLineSegments(e, i, 1, undefined, undefined)}
            onMouseOver={e => magnifyNode(e)}
            onMouseOut={e => resetNode(e)}
            // onClick={e => onClickNode(e, lineIndex)}
            // onDragMove={e => onDragNode(e, lineIndex, linePoint)}
          />);
        }
    }

    // If no line segments yet
    if (nodes.length === 0 && prevPathPoint) {
      const i = 0;
      const linePoint = 0;
      nodes.push(
        <Circle
        key={"node-" + i.toString() + "-" + linePoint.toString()}
        x={prevPathPoint.x}
        y={prevPathPoint.y}
        fill={fill}
        radius={radius}
        draggable={props.activeTool === Tool.Polygon}
        onDragEnd={e => setPrevPathPoint(new Vector2(e.target.x(), e.target.y()))}
        onMouseOver={e => magnifyNode(e)}
        onMouseOut={e => resetNode(e)}
        // onClick={e => onClickNode(e, lineIndex)}
        // onDragMove={e => onDragNode(e, lineIndex, linePoint)}
      />);
    }
    
    return <>
      {nodes}
    </>;
  }

  const LineSegments = (props: { lineSegments: Geometry.LineSegment[], geoState: number[] }) => {
    let lines: JSX.Element[] = [];
    for (let i = 0; i < props.lineSegments.length; i += 1) {
      const points: number[] = [
        props.lineSegments[i].x1(props.geoState), props.lineSegments[i].y1(props.geoState),
        props.lineSegments[i].x2(props.geoState), props.lineSegments[i].y2(props.geoState),
      ]

      lines.push(
        <Line
          key={"line-" + i.toString()}
          points={points}
          stroke={"#1c1c1cff"} />
      )
    }
    return <>{lines}</>;
  }

  // Render the nodes and lines
  const Arcs = (props: { arcs: Geometry.Arc[], activeTool: Tool }) => {
    const state = sketchState.geometrySystem.state;

    let arcsOut: JSX.Element[] = [];
    for (let i = 0; i < props.arcs.length; i += 1) {
        arcsOut.push(
          <Arc
            key={"arc-" + i.toString()}
            x={props.arcs[i].x(state)}
            y={props.arcs[i].y(state)}
            angle={(props.arcs[i].endAngle(state) - props.arcs[i].startAngle(state)) * 180 / Math.PI}
            rotation={props.arcs[i].startAngle(state) * 180 / Math.PI}
            innerRadius={props.arcs[i].radius(state)}
            outerRadius={props.arcs[i].radius(state)}
            strokeEnabled={true}
            stroke="black" />
        )
    }

    return <>
      {arcsOut}
    </>;
  }

  const Profile2D = (props: { lineSegments: Geometry.LineSegment[], arcs: Geometry.Arc[], activeTool: Tool }) => {
    return <>
      <LineSegments lineSegments={props.lineSegments} geoState={sketchState.geometrySystem.state} />
      <Nodes lineSegments={props.lineSegments} activeTool={props.activeTool} geoState={sketchState.geometrySystem.state} />
      <Arcs arcs={props.arcs} activeTool={props.activeTool} /> 
    </>
  };


  // const RadiusPickerWrapper = (props: { nodeIndex: number | undefined, nodeData: NodeData }) => {
  //   if (props.nodeIndex === undefined) {
  //     return <></>;
  //   } else {
  //     return <RadiusPicker
  //       x={props.nodeData.points[props.nodeIndex * 2]}
  //       y={props.nodeData.points[props.nodeIndex * 2 + 1]}
  //       maxRadius={100}
  //       onSetRadius={radius => {
  //         setRadius(props.nodeIndex!, radius);
  //         setSettingNodeRadIndex(undefined);
  //       }} />
  //   }
  // }

  return (
    // TODO: Idea, add stage to next level up. Might be the reason why dragging gets interrupted
    // on draw
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={window.innerWidth} height={window.innerHeight} fill={"#f0f0f0ff"} onClick={onClickStage} />
        {/* <RadiusPickerWrapper nodeIndex={settingNodeRadIndex} lineSegments={sketchState.lineSegments} /> */}
        <Profile2D lineSegments={sketchState.lineSegments} arcs={sketchState.arcs} activeTool={props.activeTool} />
      </Layer>
    </Stage>
  );
}