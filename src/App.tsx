import { Canvas } from "@react-three/fiber";

import React, { useState } from "react";
import Viewer3D from "./Viewer3D";
import SketchArea from "./SketchArea";
import ToolBar from "./ToolBar";
import 'antd/dist/antd.css';
import { Geometry } from "./GeometryElements";

export enum Tool {
  None = 1,
  Polygon = 2,
  Radius = 3
}
class AppState {
  elements: Geometry.Element[] = [];
  state: number[] = [];
}
const App = () => {
  const [activeTool, setTool] = useState<Tool>(Tool.None);
  const [appState, setAppState] = useState<AppState>(new AppState());

  const updateElements = (newElements: Geometry.Element[], state: number[]) => {
    setAppState({ ...appState, elements: [...newElements], state: [...state] });
  }

  return (
    <div>
      <ToolBar activeTool={activeTool} setTool={setTool} />
      <div style={{ display: "flex" }}>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <SketchArea activeTool={activeTool} updateElements={updateElements} />
        </div>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <Viewer3D elements={appState.elements} state={appState.state} />
        </div>
      </div>

    </div>
  );
};

export default App;
