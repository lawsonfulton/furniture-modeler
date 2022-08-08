
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

// export class PointsEqual extends Constraint {
//   constructor(private p1: Geometry.Point, public p2: Geometry.Point) {
//     super();
//   }

//   value(state: number[]): number {
    
//   }
//   gradient(state: number[], gradOut: number[]): void {
//     throw new Error("Method not implemented.");
//   }
// }

export class LinesIncident extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private l1: Geometry.LineSegment, private l2: Geometry.LineSegment) {
    super();
  }

  // Squared distance between the two endpoints
  value(state: number[]): number {
    return (this.l1.x2(state) - this.l2.x1(state)) ** 2 + (this.l1.y2(state) - this.l2.y1(state)) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    gradOut[this.l1.x2i()] += 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
    gradOut[this.l1.y2i()] += 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
    gradOut[this.l2.x1i()] -= 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
    gradOut[this.l2.y1i()] -= 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
  }
}

export class LineArcTangent extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private seg: Geometry.LineSegment, private arc: Geometry.Arc) {
    super();
  }

  // Squared distance between the two endpoints
  value(state: number[]): number {
    return (this.l1.x2(state) - this.l2.x1(state)) ** 2 + (this.l1.y2(state) - this.l2.y1(state)) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    gradOut[this.l1.x2i()] += 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
    gradOut[this.l1.y2i()] += 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
    gradOut[this.l2.x1i()] -= 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
    gradOut[this.l2.y1i()] -= 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
  }
}

// export class FixedPoint extends Constraint {
//   constructor(private p: Point, private x: number, private y: number) {
//     super();
//     this.p = p;
//     this.x = x;
//     this.y = y;
//   }

//   value(state: number[]): number {
//     return (state[this.p.xi] - this.x) ** 2 + (state[this.p.yi] - this.y) ** 2;
//   }

//   gradient(state: number[], gradOut: number[]): void {
//     gradOut[this.p.xi] += 2 * (state[this.p.xi] - this.x);
//     gradOut[this.p.yi] += 2 * (state[this.p.yi] - this.y);
//   }
// }

