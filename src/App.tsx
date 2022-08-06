import { Canvas } from "@react-three/fiber";

import React, { useState } from "react";
import Viewer3D from "./Viewer3D";
import SketchArea from "./SketchArea";
import ToolBar from "./ToolBar";
import 'antd/dist/antd.css';

export class AppState {
  points: number[] = [];
  linePoints: number[] = [];
  isDrawing: boolean = false;
}
export interface StateCallbacks {
  addPoint: (x: number, y: number) => void;
  setPoint: (i: number, x: number, y: number) => void;
  setLinePoint: (i: number, x: number, y: number) => void;
}

const App = () => {
  const [state, setState] = useState<AppState>(new AppState());

  const stateCallbacks: StateCallbacks = {
    addPoint: (x: number, y: number) => {
      setState({ ...state, points: [...state.points, x, y], linePoints: [...state.linePoints, x, y] })
      // setState((prevState) => {
      //   const newPoints = [...prevState.points, x, y];
      //   return { ...prevState, points: newPoints };
      // })
    },

    setLinePoint: (i: number, x: number, y: number) => {
      const newPoints = [...state.linePoints];
      newPoints[i] = x;
      newPoints[i + 1] = y;
      setState({ ...state, linePoints: newPoints });


      // setState((prevState) => {
      //   const newPoints = [...prevState.points];
      //   newPoints[i] = x;
      //   newPoints[i + 1] = y;
      //   return { ...prevState, points: newPoints };
      // })
    },

    setPoint: (i: number, x: number, y: number) => {
      const newPoints = [...state.points];
      newPoints[i] = x;
      newPoints[i + 1] = y;
      setState({ ...state, points: newPoints });


      // setState((prevState) => {
      //   const newPoints = [...prevState.points];
      //   newPoints[i] = x;
      //   newPoints[i + 1] = y;
      //   return { ...prevState, points: newPoints };
      // })
    }
  }



  return (
    <div>
      <ToolBar />
      <div style={{ display: "flex" }}>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <SketchArea appState={state} callbacks={stateCallbacks} />
        </div>
        <div style={{ width: "50vw", height: "100vh", display: "inline-block" }}>
          <Viewer3D />
        </div>
      </div>

    </div>
  );
};

export default App;
