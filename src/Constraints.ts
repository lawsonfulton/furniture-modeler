
// export class Point {
//   // Indices into points array
//   constructor(public xi: number, public yi: number) {
//     this.xi = xi;
//     this.yi = yi;
//   }
// }

import { Geometry } from "./GeometryElements";

// export class LineSegment {
//   constructor(public p1: Point, public p2: Point) {
//     this.p1 = p1;
//     this.p2 = p2;
//   }
// }

export abstract class Constraint {
  // Objective function value for this constraint as a function of the
  // entire state vector.
  abstract value(state: number[]): number;

  // Note that gradOut is of dimension state.length
  // it will be zero initialized and result must be *added* to it
  abstract gradient(state: number[], gradOut: number[]): void;
}

export class PointsEqual extends Constraint {
  constructor(private p1: Geometry.Point, public p2: Geometry.Point) {
    super();
  }
  value(state: number[]): number {
    throw new Error("Method not implemented.");
  }
  gradient(state: number[], gradOut: number[]): void {
    throw new Error("Method not implemented.");
  }
}

export class LinesIncident extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private l1: Geometry.LineSegment, private l2: Geometry.LineSegment) {
    super();
    this.l1 = l1;
    this.l2 = l2;
  }

  // Squared distance between the two endpoints
  value(state: number[]): number {
    const l1p2 = this.l1.p2;
    const l2p1 = this.l2.p1;
    return (state[l1p2.xi] - state[l2p1.xi]) ** 2 + (state[l1p2.yi] - state[l2p1.yi]) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    const l1p2 = this.l1.p2;
    const l2p1 = this.l2.p1;
    gradOut[l1p2.xi] += 2 * (state[l1p2.xi] - state[l2p1.xi]);
    gradOut[l1p2.yi] += 2 * (state[l1p2.yi] - state[l2p1.yi]);
    gradOut[l2p1.xi] -= 2 * (state[l1p2.xi] - state[l2p1.xi]);
    gradOut[l2p1.yi] -= 2 * (state[l1p2.yi] - state[l2p1.yi]);
  }
}

export class FixedPoint extends Constraint {
  constructor(private p: Point, private x: number, private y: number) {
    super();
    this.p = p;
    this.x = x;
    this.y = y;
  }

  value(state: number[]): number {
    return (state[this.p.xi] - this.x) ** 2 + (state[this.p.yi] - this.y) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    gradOut[this.p.xi] += 2 * (state[this.p.xi] - this.x);
    gradOut[this.p.yi] += 2 * (state[this.p.yi] - this.y);
  }
}

