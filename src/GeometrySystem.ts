import { CopyTwoTone } from "@ant-design/icons";
import { Vector2 } from "three";
import { Constraint } from "./Constraints";
import ConstraintSolver from "./ConstraintSolver";
import { Geometry } from "./GeometryElements";

export class GeometrySystem {
  elements: Geometry.Element[] = [];
  constraints: Constraint[] = [];
  state: number[] = [];

  shallowCopy(): GeometrySystem {
    const copy = new GeometrySystem();
    copy.elements = this.elements.slice();
    copy.constraints = this.constraints.slice();
    copy.state = this.state;
    return copy;
  }

  addLineSegment(x1: number, y1: number, x2: number, y2: number): Geometry.LineSegment {
    const offset = this.state.length;
    this.state = this.extendState(Geometry.LineSegment.dims());
    const seg = new Geometry.LineSegment(x1, y1, x2, y2, this.state, offset);
    this.addElement(seg);
    return seg;
  }

  addArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): Geometry.Arc {
    const offset = this.state.length;
    this.state = this.extendState(Geometry.LineSegment.dims());
    const arc = new Geometry.Arc(x, y, radius, startAngle, endAngle, this.state, offset);
    this.addElement(arc);
    return arc;
  }

  addConstraint(c: Constraint): Constraint {
    this.constraints.push(c);
    return c;
  }

  solve() {
    const solver = new ConstraintSolver(this.constraints);
    this.state = solver.solve(this.state);
  }

  private extendState(dims: number): number[] {
    return this.state.concat(Array(dims).fill(0));
  }

  private addElement(e: Geometry.Element) {
    this.elements.push(e);
  }
}
