import { Canvas } from "@react-three/fiber";

import React from "react";
import Viewer3D from "./Viewer3D";
import SketchArea from "./SketchArea";
import ToolBar from "./ToolBar";
import 'antd/dist/antd.css';

const App = () => {
  return (
    <div>
      <ToolBar />
      <div style={{ display: "flex" }}>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <SketchArea />
        </div>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <Viewer3D />
        </div>
      </div>

    </div>
  );
};

export default App;
