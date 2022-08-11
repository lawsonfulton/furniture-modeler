import React, { ReactElement, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Circle, Line, Group, Arc } from "react-konva";
import Konva from "konva";
import { Tool } from "./App";
import { Vector2 } from "three";
import { Geometry } from "./GeometryElements";
import { GeometrySystem } from "./GeometrySystem";
import { Constraint, FixedArcRadius, LineArcIncident, LineArcTangent, LineSegmentAligned, LineSegmentFixedPoint } from "./Constraints";

class SketchState {
  lineSegments: Geometry.LineSegment[] = [];
  arcs: Geometry.Arc[] = [];
  pointConstraints: Constraint[][] = [];

  // Every element must be registed with the geometry system
  geometrySystem: GeometrySystem = new GeometrySystem();
}

interface SketchAreaProps {
  activeTool: Tool;
  updateElements: (elements: Geometry.Element[], state: number[]) => void;
}

export default function SketchArea(props: SketchAreaProps) {
  const [sketchState, setSketchState] = useState<SketchState>(new SketchState());
  const [initialPathPoint, setInitialPathPoint] = useState<Vector2 | undefined>(undefined);

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
      props.updateElements(geoSystem.elements, geoSystem.state);
    }

    setInitialPathPoint(new Vector2(x / sceneScale, y / sceneScale));
  }

  const onClickStage = (e) => {
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();

    if (props.activeTool === Tool.Polygon) {
      addPointToPath(mousePos.x, mousePos.y);
    }
  };

  // const onDragNode = (e, lineIndex: number, linePoint: number) => {
    // Update points array directly while dragging
    // Calling setState forces a redraw which interrupts the
    // dragging event handler. So skipping this for the time being.

    // setSketchState(sketchState => {
    //   const state = sketchState.geometrySystem.state;
    //   const newSketchState = { ...sketchState };
    //   newSketchState.lineSegments[lineIndex].set(state, linePoint, e.target.x(), e.target.y());
    //   return newSketchState;
    // });
  // };
  
  const updateLineSegments = (e, lineIndex1: number, LineEndPoint: Geometry.LineEndPoint, lineIndex2: number | undefined, linePoint2: number | undefined) => {
    // When done dragging trigger the state update.
    setSketchState(sketchState => {
      const state = sketchState.geometrySystem.state;
      const newSketchState = { ...sketchState };
      newSketchState.lineSegments[lineIndex1].set(state, LineEndPoint, e.target.x() / sceneScale, e.target.y() / sceneScale);
      if(lineIndex2 !== undefined && linePoint2 !== undefined && lineIndex2 >= 0) {
        newSketchState.lineSegments[lineIndex2].set(state, linePoint2, e.target.x() / sceneScale, e.target.y() / sceneScale);
      }
      newSketchState.geometrySystem.solve();
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
      // Need to make a shallow copy for react
      let geoSystem = sketchState.geometrySystem.shallowCopy();
      const state = geoSystem.state;
      
      let seg1 = sketchState.lineSegments[line1];
      let seg2 = sketchState.lineSegments[line2];

      // Make a guess
      const l1p2y = seg1.y(state, point2);
      const l2p2y = seg2.y(state, point2);
      let startAngle = 0;
      let endAngle = 0;
      // if (l1p2y > l2p2y) {
        startAngle = (180 + 60) * Math.PI / 180;
        endAngle = (360 - 60) * Math.PI / 180;// 270 * Math.PI / 180;
      // } else {
      //   startAngle = (60) * Math.PI / 180;
      //   endAngle = (90 + 30) * Math.PI / 180;// 270 * Math.PI / 180;
      // }

      const radius = 0.3;
      const x = seg1.x(state, point1);
      const y = seg1.y(state, point1);
      const arc = geoSystem.addArc(x, y, 0.2, startAngle, endAngle);


      // if (l1p2y > l2p2y) {
        geoSystem.addConstraint(new LineArcTangent(seg1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START, false));
        geoSystem.addConstraint(new LineArcTangent(seg2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END, false));
      // } else {
      //   geoSystem.addConstraint(new LineArcTangent(seg1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.END, true));
      //   geoSystem.addConstraint(new LineArcTangent(seg2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.START, true));
      // }

      geoSystem.addConstraint(new FixedArcRadius(arc, radius));
      geoSystem.addConstraint(new LineArcIncident(seg1, Geometry.LineEndPoint.P2, arc, Geometry.ArcEndPoint.START));
      geoSystem.addConstraint(new LineArcIncident(seg2, Geometry.LineEndPoint.P1, arc, Geometry.ArcEndPoint.END));

      geoSystem.addConstraint(new LineSegmentAligned(state, seg1));
      geoSystem.addConstraint(new LineSegmentAligned(state, seg2));

      geoSystem.solve();

      setSketchState(sketchState => {
        return {
          ...sketchState,
          arcs: [...sketchState.arcs, arc],
          geometrySystem: geoSystem
        };
      }); 
      props.updateElements(geoSystem.elements, geoSystem.state);
    }
  }

  // Render the nodes and lines
  const Nodes = (props: { lineSegments: Geometry.LineSegment[], activeTool: Tool, geoState: number[] }) => {
    const fill = "#272727ff";
    const radius = 3.5;

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
            onClick={e => prevLine !== undefined ? addArc(e, prevLine, Geometry.LineEndPoint.P2, i, Geometry.LineEndPoint.P1) : undefined}
          />);

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
            />);
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
      if (ea < sa) {
        console.log("Swapping angles");
        const temp = ea;
        ea = sa;
        sa = temp;
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