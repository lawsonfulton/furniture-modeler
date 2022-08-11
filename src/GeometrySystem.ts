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

  // private dims(): number {
  //   return this.elements.reduce((acc, e) => acc + e.dims(), 0);
  // }

  private addElement(e: Geometry.Element) {
    this.elements.push(e);
    }

  // private assembleState(state: number[]): void {
  //   let offset = 0;
  //   for (let e of this.elements) {
  //     e.assembleState(state, offset);
  //     offset += e.dims();
  //   }

  //   if (offset !== this.dims()) {
  //     throw "State vector is not the correct size";
  //   }
  // }

  // private updateFromState(state: number[]): void {
  //   let offset = 0;
  //   for (let e of this.elements) {
  //     e.updateFromState(state, offset);
  //     offset += e.dims();
  //   }

  //   if (offset !== this.dims()) {
  //     throw "State vector is not the correct size";
  //   }
  // }
}
