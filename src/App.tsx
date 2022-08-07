import { Canvas } from "@react-three/fiber";

import React, { useState } from "react";
import Viewer3D from "./Viewer3D";
import SketchArea from "./SketchArea";
import ToolBar from "./ToolBar";
import 'antd/dist/antd.css';

export enum Tool {
  None = 1,
  Polygon = 2,
  Radius = 3
}

export class AppState {
  // points: number[] = [];
  // linePoints: number[] = [];
  // isDrawing: boolean = false;
}
export interface StateCallbacks {
  // addPoint: (x: number, y: number) => void;
  // setPoint: (i: number, x: number, y: number) => void;
  // setLinePoint: (i: number, x: number, y: number) => void;
}

const App = () => {
  const [state, setState] = useState<AppState>(new AppState());
  const [activeTool, setTool] = useState<Tool>(Tool.None);


  return (
    <div>
      <ToolBar activeTool={activeTool} setTool={setTool} />
      <div style={{ display: "flex" }}>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <SketchArea activeTool={activeTool} />
        </div>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <Viewer3D />
        </div>
      </div>

    </div>
  );
};

export default App;
