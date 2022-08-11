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
import { Constraint, FixedArcRadius, LineArcIncident, LineArcTangent, LineSegmentAligned, LineSegmentFixedPoint } from "./Constraints";
// import { Constraint, FixedPoint, LineSegment, LinesIncident, Point } from "./Constraints";

// TODO
// - Add aligned segment constraint
// - Allow moving points
// - Add 3d extrusion
// - clean up the code
// - Final polish

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
  const [initialPathPoint, setInitialPathPoint] = useState<Vector2 | undefined>(undefined);

  // Index of node whose radius is being set
  const [settingNodeRadIndex, setSettingNodeRadIndex] = useState<number | undefined>(undefined);

  {
    const geo = sketchState.geometrySystem;
    const line1 = geo.addLineSegment(0.5, 2, 2.00, 1.50)
    sketchState.lineSegments.push(line1);
    const line2 = geo.addLineSegment(2, 1.5, 3, 2)
    sketchState.lineSegments.push(line2);

    const startAngle = 4.1888;
    const endAngle = 5.236;// 270 * Math.PI / 180;
    // const startAngle = (45) * Math.PI / 180;
    // const endAngle = (100) * Math.PI / 180;
    // const startAngle = (90) * Math.PI / 180;
    // const endAngle = (180) * Math.PI / 180;
    const radius = 0.56;
    // const arc = geo.addArc(205, 130, radius, startAngle, endAngle);
    const arc = geo.addArc(2, 1.5, radius, startAngle, endAngle);
    sketchState.arcs.push(arc);

    let state = sketchState.geometrySystem.state;

    geo.addConstraint(new LineSegmentFixedPoint(state, line1, Geometry.LineEndPoint.P1));
    geo.addConstraint(new LineSegmentFixedPoint(state, line2, Geometry.LineEndPoint.P2));

    geo.addConstraint(new LineArcTangent(line1, arc, Geometry.ArcEndPoint.START));
    geo.addConstraint(new LineArcTangent(line2, arc, Geometry.ArcEndPoint.END));
    geo.addConstraint(new FixedArcRadius(arc, radius));
    geo.addConstraint(new LineArcIncident(line1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
    geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));

    geo.addConstraint(new LineSegmentAligned(state, line1));
    // geo.addConstraint(new LineSegmentAligned(state, line2));
    // geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P2, arc));

    geo.solve();
    state = sketchState.geometrySystem.state;
    console.log("startAngle: ", arc.startAngle(state));
    console.log("endAngle: ", arc.endAngle(state));
    console.log("radius: ", arc.radius(state));
    console.log("x: ", arc.x(state));
    console.log("y: ", arc.y(state));
  }
  // {
  //   const geo = sketchState.geometrySystem;
  //   const line1 = geo.addLineSegment(1.10, 1.00, 1.70, 0.50)
  //   // const line1 = geo.addLineSegment(2.20, 1.55, 3.00, 1.50)
  //   sketchState.lineSegments.push(line1);
  //   const line2 = geo.addLineSegment(2.10, 1.00, 3.10, 1.00)
  //   sketchState.lineSegments.push(line2);

  //   const startAngle = (180 + 45) * Math.PI / 180;
  //   const endAngle = (360 - 45) * Math.PI / 180;// 270 * Math.PI / 180;
  //   // const startAngle = (45) * Math.PI / 180;
  //   // const endAngle = (100) * Math.PI / 180;
  //   // const startAngle = (90) * Math.PI / 180;
  //   // const endAngle = (180) * Math.PI / 180;
  //   const radius = 0.60;
  //   // const arc = geo.addArc(205, 130, radius, startAngle, endAngle);
  //   const arc = geo.addArc(2, 1, radius, startAngle, endAngle);
  //   sketchState.arcs.push(arc);

  //   let state = sketchState.geometrySystem.state;

  //   geo.addConstraint(new LineSegmentFixedPoint(line1, Geometry.LineEndPoint.P1, 1.10, 1.0));
  //   geo.addConstraint(new LineSegmentFixedPoint(line2, Geometry.LineEndPoint.P2, 3.10, 1.0));

  //   geo.addConstraint(new LineArcTangent(line1, arc, Geometry.ArcEndPoint.START));
  //   geo.addConstraint(new LineArcTangent(line2, arc, Geometry.ArcEndPoint.END));
  //   geo.addConstraint(new FixedArcRadius(arc, radius));
  //   geo.addConstraint(new LineArcIncident(line1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
  //   geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));
  //   // geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P2, arc));

  //   geo.solve();
  //   state = sketchState.geometrySystem.state;
  //   console.log("startAngle: ", arc.startAngle(state));
  //   console.log("endAngle: ", arc.endAngle(state));
  //   console.log("radius: ", arc.radius(state));
  //   console.log("x: ", arc.x(state));
  //   console.log("y: ", arc.y(state));

  // }
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
    if (initialPathPoint) {
      let startingX: number;
      let startingY: number;
      if (sketchState.lineSegments.length > 0) {
        const state = sketchState.geometrySystem.state;
        startingX = sketchState.lineSegments[sketchState.lineSegments.length - 1].x2(state);
        startingY = sketchState.lineSegments[sketchState.lineSegments.length - 1].y2(state);
      } else {
        startingX = initialPathPoint.x;
        startingY = initialPathPoint.y;
      }

      // Need to make a shallow copy for react
      let geoSystem = sketchState.geometrySystem.shallowCopy();

      // Create / register our line segment
      const lineSeg = geoSystem.addLineSegment(startingX, startingY, x / sceneScale, y / sceneScale);

      setSketchState(sketchState => {
        return {
          ...sketchState,
          lineSegments: [...sketchState.lineSegments, lineSeg],
          geometrySystem: geoSystem
        };
      });
    }

    setInitialPathPoint(new Vector2(x / sceneScale, y / sceneScale));
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
  
  const updateLineSegments = (e, lineIndex1: number, LineEndPoint: Geometry.LineEndPoint, lineIndex2: number | undefined, linePoint2: number | undefined) => {
    // When done dragging trigger the state update.
    setSketchState(sketchState => {
      const state = sketchState.geometrySystem.state;
      const newSketchState = { ...sketchState };
      newSketchState.lineSegments[lineIndex1].set(state, LineEndPoint, e.target.x() / sceneScale, e.target.y() / sceneScale);
      if(lineIndex2 !== undefined && linePoint2 !== undefined && lineIndex2 >= 0) {
        newSketchState.lineSegments[lineIndex2].set(state, linePoint2, e.target.x() / sceneScale, e.target.y() / sceneScale);
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

  const sceneScale = 100.0;

  const addArc = (e, line1: number, point1: Geometry.LineEndPoint, line2: number, point2: Geometry.LineEndPoint) => {
    if (props.activeTool === Tool.Radius && sketchState.lineSegments.length > 1) {
      // console.log("Choosing radius for node ", i);
      // setSettingNodeRadIndex(i);

      // Need to make a shallow copy for react
      let geoSystem = sketchState.geometrySystem.shallowCopy();
      const state = geoSystem.state;
      
      let seg1 = sketchState.lineSegments[line1];
      let seg2 = sketchState.lineSegments[line2];

      // seg1.set(state, point1, seg1.x(state, point1) + 1, seg1.y(state, point1) + 1);

      console.log("line1", line1);
      console.log("point1", point1);
      console.log("line2", line2);
      console.log("point2", point2);

      const radius = 0.2;
      const x = seg1.x(state, point1);
      const y = seg1.y(state, point1);
      // const startAngle = 220 * Math.PI / 180;
      // const endAngle = 270 * Math.PI / 180;
      // const startAngle = 0;// 220 * Math.PI / 180;
      // const endAngle = 360 * Math.PI / 180;// 270 * Math.PI / 180;
      const startAngle = (180 + 60) * Math.PI / 180;
      const endAngle = (360 - 60) * Math.PI / 180;// 270 * Math.PI / 180;
      const arc = geoSystem.addArc(x, y, radius, startAngle, endAngle);

      const fixedEnd1 = Geometry.otherEnd(point1);
      geoSystem.addConstraint(new LineSegmentFixedPoint(state, seg1, fixedEnd1));
      const fixedEnd2 = Geometry.otherEnd(point2);
      geoSystem.addConstraint(new LineSegmentFixedPoint(state, seg2, fixedEnd2));
      // geoSystem.addConstraint(new LineSegmentFixedPoint(seg2, Geometry.LineEndPoint.P2, seg2.x2(state), seg2.y2(state)));

      geoSystem.addConstraint(new LineArcTangent(seg1, arc, Geometry.ArcEndPoint.START));
      geoSystem.addConstraint(new LineArcTangent(seg2, arc, Geometry.ArcEndPoint.END));
      geoSystem.addConstraint(new FixedArcRadius(arc, radius));
      geoSystem.addConstraint(new LineArcIncident(seg1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
      geoSystem.addConstraint(new LineArcIncident(seg2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));

      geoSystem.addConstraint(new LineSegmentAligned(state, seg1));
      geoSystem.addConstraint(new LineSegmentAligned(state, seg2));

    // geo.addConstraint(new LineArcTangent(line1, arc, Geometry.ArcEndPoint.START));
    // geo.addConstraint(new LineArcTangent(line2, arc, Geometry.ArcEndPoint.END));
    // geo.addConstraint(new FixedArcRadius(arc, radius));
    // geo.addConstraint(new LineArcIncident(line1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
    // geo.addConstraint(new LineArcIncident(line2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));

      geoSystem.solve();

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
      const nextLine = i < props.lineSegments.length - 1 ? i + 1 : undefined;
        nodes.push(
          <Circle
            key={"node-" + i.toString() + "-" + Geometry.LineEndPoint.P1.toString()}
            x={props.lineSegments[i].x1(props.geoState) * sceneScale}
            y={props.lineSegments[i].y1(props.geoState) * sceneScale}
            fill={fill}
            radius={radius}
            draggable={props.activeTool === Tool.Polygon}
            onDragEnd={e => updateLineSegments(e, i, Geometry.LineEndPoint.P1, prevLine, Geometry.LineEndPoint.P2)}
            onMouseOver={e => magnifyNode(e)}
            onMouseOut={e => resetNode(e)}
            // onClick={e => prevLine !== undefined ? addArc(e, i, Geometry.LineEndPoint.P1, prevLine, Geometry.LineEndPoint.P2) : undefined}
            onClick={e => prevLine !== undefined ? addArc(e, prevLine, Geometry.LineEndPoint.P2, i, Geometry.LineEndPoint.P1) : undefined}

          />);

          // if(i === props.lineSegments.length - 1) { // Add the last node
          nodes.push(
            <Circle
              key={"node-" + i.toString() + "-1"}
              x={props.lineSegments[i].x2(props.geoState) * sceneScale}
              y={props.lineSegments[i].y2(props.geoState) * sceneScale}
              fill={fill}
              radius={radius}
              draggable={props.activeTool === Tool.Polygon}
              onDragEnd={e => updateLineSegments(e, i, Geometry.LineEndPoint.P2, nextLine, Geometry.LineEndPoint.P1)}
              onMouseOver={e => magnifyNode(e)}
              onMouseOut={e => resetNode(e)}
              onClick={e => nextLine !== undefined ? addArc(e, i, Geometry.LineEndPoint.P2, nextLine, Geometry.LineEndPoint.P1) : undefined}
            // onClick={e => onClickNode(e, lineIndex)}
            // onDragMove={e => onDragNode(e, lineIndex, linePoint)}
          />);
        // }
    }

    // If no line segments yet
    if (nodes.length === 0 && initialPathPoint) {
      const i = 0;
      const linePoint = 0;
      nodes.push(
        <Circle
        key={"node-" + i.toString() + "-" + linePoint.toString()}
          x={initialPathPoint.x * sceneScale}
          y={initialPathPoint.y * sceneScale}
        fill={fill}
        radius={radius}
        draggable={props.activeTool === Tool.Polygon}
          onDragEnd={e => setInitialPathPoint(new Vector2(e.target.x(), e.target.y()))}
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
        props.lineSegments[i].x1(props.geoState) * sceneScale, props.lineSegments[i].y1(props.geoState) * sceneScale,
        props.lineSegments[i].x2(props.geoState) * sceneScale, props.lineSegments[i].y2(props.geoState) * sceneScale,
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
      let sa = props.arcs[i].startAngle(state) % (2 * Math.PI);
      let ea = props.arcs[i].endAngle(state) % (2 * Math.PI);
      if (sa < 0) {
        sa += 2 * Math.PI;
      }
      if (ea < 0) {
        ea += 2 * Math.PI;
      }
      // let sa = props.arcs[i].startAngle(state);
      // let ea = props.arcs[i].endAngle(state);
      console.log("ea", ea * 180 / Math.PI);
      console.log("sa", sa * 180 / Math.PI);
      // if (ea < sa) {
      //   console.log("Swapping angles");
      //   const temp = ea;
      //   ea = sa;
      //   sa = temp;
      // }
      const r = props.arcs[i].radius(state) > 0 ? props.arcs[i].radius(state) : 0;

      const angle = (ea - sa) * 180 / Math.PI;
      const rotation = sa * 180 / Math.PI;
        arcsOut.push(
          <Arc
            key={"arc-" + i.toString()}
            x={props.arcs[i].x(state) * sceneScale}
            y={props.arcs[i].y(state) * sceneScale}
            angle={angle}
            rotation={rotation}
            innerRadius={r * sceneScale}
            outerRadius={r * sceneScale}
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