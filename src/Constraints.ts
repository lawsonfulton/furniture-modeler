
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
  // Expression that we want == 0 
  abstract expression(state: number[]): number;

  // Objective function value for this constraint as a function of the
  // entire state vector.
  // Function that we we can minimize (square of expression)
  value(state: number[]): number {
    return this.expression(state) ** 2;
  }

  // This is the gradient of *value* not the expression. (so must be multiplied by 2 x expression)
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

// export class LinesIncident extends Constraint {
//   // point 2 of l1 incident to point 1 of l2
//   constructor(private l1: Geometry.LineSegment, private l2: Geometry.LineSegment) {
//     super();
//   }

//   // Squared distance between the two endpoints
//   value(state: number[]): number {
//     return (this.l1.x2(state) - this.l2.x1(state)) ** 2 + (this.l1.y2(state) - this.l2.y1(state)) ** 2;
//   }

//   gradient(state: number[], gradOut: number[]): void {
//     gradOut[this.l1.x2i()] += 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
//     gradOut[this.l1.y2i()] += 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
//     gradOut[this.l2.x1i()] -= 2 * (state[this.l1.x2i()] - state[this.l2.x1i()]);
//     gradOut[this.l2.y1i()] -= 2 * (state[this.l1.y2i()] - state[this.l2.y1i()]);
//   }
// }

export class LineArcTangent extends Constraint {
  constructor(private seg: Geometry.LineSegment, private arc: Geometry.Arc) {
    super();
  }

  expression(state: number[]): number {
    const p1x = this.seg.x1(state);
    const p1y = this.seg.y1(state);
    const p2x = this.seg.x2(state);
    const p2y = this.seg.y2(state);
    const ax = this.arc.x(state);
    const ay = this.arc.y(state);
    return p2x * ax - p1x * ax + p2y * ay - p1y * ay - p2x ** 2 + p2x * p1x - p2y ** 2 + p2y * p1y;
  }

  gradient(state: number[], gradOut: number[]): void {
    const exprX2 = 2 * this.expression(state); // for chain rule

    const p1x = this.seg.x1(state);
    const p1xi = this.seg.x1i();
    const p1y = this.seg.y1(state);
    const p1yi = this.seg.y1i();
    const p2x = this.seg.x2(state);
    const p2xi = this.seg.x2i();
    const p2y = this.seg.y2(state);
    const p2yi = this.seg.y2i();
    const ax = this.arc.x(state);
    const axi = this.arc.xi();
    const ay = this.arc.y(state);
    const ayi = this.arc.yi();

    gradOut[axi] += (p2x - p1x) * exprX2;
    gradOut[ayi] += (p2y - p1y) * exprX2;

    // TODO do we really want to comment these out?
    // gradOut[p1xi] += -ax * exprX2;
    // gradOut[p1yi] += -ay * exprX2;
    // gradOut[p2xi] += (ax + p1x - 2 * p2x) * exprX2;
    // gradOut[p2yi] += (ay + p1y - 2 * p2y) * exprX2;
  }
}


export class LineArcIncident extends Constraint {
  constructor(private seg: Geometry.LineSegment, private lineEndPoint: Geometry.LineEndPoint, private arc: Geometry.Arc) {
    super();
  }

  expression(state: number[]): number {
    const p1x = this.seg.x1(state);
    const p1y = this.seg.y1(state);
    const ax = this.arc.x(state);
    const ay = this.arc.y(state);
    const sa = this.arc.startAngle(state);
    const r = this.arc.radius(state);
    return (r * Math.sin(sa - Math.PI) + ax - p1x) ** 2 + (r * Math.cos(sa - Math.PI) + ay - p1y) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    const exprX2 = 2 * this.expression(state); // for chain rule

    const p1x = this.seg.x1(state);
    const p1xi = this.seg.x2i();
    const p1y = this.seg.y1(state);
    const p1yi = this.seg.y2i();
    const sa = this.arc.startAngle(state);
    const sai = this.arc.startAnglei();
    const r = this.arc.radius(state);
    const ri = this.arc.radiusi();
    const ax = this.arc.x(state);
    const axi = this.arc.xi();
    const ay = this.arc.y(state);
    const ayi = this.arc.yi();

    // gradOut[p1xi] += -2 * (r * Math.sin(sa - Math.PI) + ax - p1x) * exprX2;
    // gradOut[p1yi] += - 2 * (r * Math.cos(sa - Math.PI) + ay - p1y) * exprX2;
    gradOut[sai] += (r * Math.cos(sa - Math.PI) * 2 * (r * Math.sin(sa - Math.PI) + ax - p1x)) * exprX2;
    // gradOut[ri] += (Math.sin(sa - Math.PI) * 2 * (r * Math.sin(sa - Math.PI) + ax - p1x)
    //   + Math.cos(sa - Math.PI) * 2 * (r * Math.cos(sa - Math.PI) + ay - p1y)) * exprX2;
    gradOut[axi] += 2 * (r * Math.sin(sa - Math.PI) + ax - p1x) * exprX2;
    gradOut[ayi] += 2 * (r * Math.cos(sa - Math.PI) + ay - p1y) * exprX2;
  }
}

export class FixedArcRadius extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private arc: Geometry.Arc, private radius: number) {
    super();
  }

  expression(state: number[]): number {
    return this.arc.radius(state) - this.radius;
  }

  gradient(state: number[], gradOut: number[]): void {
    gradOut[this.arc.radiusi()] += 2 * this.expression(state);
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

