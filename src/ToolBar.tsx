import Icon from "@ant-design/icons";
import { Button, Col, Row } from "antd";
import React, { ReactElement, useRef, useState } from "react";
import { Tool } from "./App";
import { ReactComponent as PolySVG } from "./img/polygon.svg";
import { ReactComponent as RadiusSVG } from "./img/radius-tool.svg";


const polyTool = <Icon component={PolySVG} style={{ fill: "blue" }} />;
const radiusTool = <Icon component={RadiusSVG} style={{ fill: "blue" }} />;

interface ToolBarProps {
  activeTool: Tool;
  setTool: (tool: Tool) => void;
}

export default function ToolBar(props: ToolBarProps) {
  return (
    <Row gutter={8} align="middle" style={{ height: "40px", paddingLeft: "10px", backgroundColor: "lightgrey" }}>
      <Col>
        <Button
          icon={polyTool}
          type={props.activeTool === Tool.Polygon ? "primary" : "default"}
          size={"middle"}
          style={{ verticalAlign: "middle" }}
          onClick={e => props.setTool(Tool.Polygon)} />
      </Col>
      <Col>
        <Button
          icon={radiusTool}
          type={props.activeTool === Tool.Radius ? "primary" : "default"}
          size={"middle"}
          style={{ verticalAlign: "middle" }}
          onClick={e => props.setTool(Tool.Radius)} />
      </Col>
    </Row >
  );
}