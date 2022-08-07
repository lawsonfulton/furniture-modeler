import { Constraint } from "./Constraints";
import ConstraintSolver from "./ConstraintSolver";
import { Geometry } from "./GeometryElements";

export class GeometrySystem {
  elements: Geometry.Element[] = [];
  constraints: Constraint[] = [];

  dims(): number {
    return this.elements.reduce((acc, e) => acc + e.dims(), 0);
  }

  addLineSegment(x1: number, y1: number, x2: number, y2: number) {

  }

  addElement(e: Geometry.Element) {
    e.setOffset(this.elements.length);
    this.elements.push(e);
  }

  addConstraint(c: Constraint) {
    this.constraints.push(c);
  }

  private assembleState(state: number[]): void {
    let offset = 0;
    for (let e of this.elements) {
      e.assembleState(state, offset);
      offset += e.dims();
    }

    if (offset !== this.dims()) {
      throw "State vector is not the correct size";
    }
  }

  private updateFromState(state: number[]): void {
    let offset = 0;
    for (let e of this.elements) {
      e.updateFromState(state, offset);
      offset += e.dims();
    }

    if (offset !== this.dims()) {
      throw "State vector is not the correct size";
    }
  }

  solve() {
    let state = Array(this.dims()).fill(0);
    this.assembleState(state);

    const solver = new ConstraintSolver(this.constraints);
    state = solver.solve(state);

    // Lots of copying happening here. Of course, this can be optimized.
    this.updateFromState(state);
  }
}
