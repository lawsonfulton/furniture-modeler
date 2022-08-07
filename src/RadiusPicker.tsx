import React from "react";
import { useState } from "react";
import { Circle, Layer } from "react-konva";


interface RadiusPickerToolProps {
  x: number;
  y: number;
  maxRadius: number;
  onSetRadius: (radius: number) => void;
}

export default function RadiusPickerTool(props: RadiusPickerToolProps) {
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
