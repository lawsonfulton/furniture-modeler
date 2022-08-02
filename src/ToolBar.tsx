import Icon from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React, { ReactElement, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import { ReactComponent as LineSVG } from "./line-tool.svg";

export default function ToolBar() {
  // const [points, setPoints] = useState<number[]>([]);

  const activateLineTool = () => {

  };

  const lineTool = <Icon component={LineSVG} style={{ fill: "blue" }} />;
  // <div style={{ height: "70px", paddingLeft: "10px", backgroundColor: "whitesmoke" }}>
  //   {/* <button ><img src="./images/line-tool.png" className="tool-button" alt="Line Tool" onClick={activateLineTool} /></button> */}
  //   {/* < img src="./images/line-tool.png" className="tool-button" alt="Line Tool" onClick={activateLineTool} /> */}
  //   <Button type="primary" icon={lineTool} size={"middle"} />
  // </div >

  return (
    <Row align="middle" style={{ height: "40px", paddingLeft: "10px", backgroundColor: "lightgrey" }}>
      <Col>
        <Button type="default" icon={lineTool} size={"middle"} style={{ verticalAlign: "middle" }} />
      </Col>
    </Row >
    // <Button type="primary">Primary Button</Button>
  );
}