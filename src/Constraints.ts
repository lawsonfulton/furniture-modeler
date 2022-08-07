
export class Point {
  // Indices into points array
  constructor(public xi: number, public yi: number) {
    this.xi = xi;
    this.yi = yi;
  }
}

export class LineSegment {
  constructor(public p1: Point, public p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }
}

export abstract class Constraint {
  // abstract indices(): number[];

  // Objective function value for this constraint as a function of the
  // entire state vector.
  abstract value(allPoints: number[]): number;

  // Note that gradOut is of dimension allPoints.length
  // it will be zero initialized and result must be *added* to it
  abstract gradient(allPoints: number[], gradOut: number[]): void;
}

export class LinesIncident extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private l1: LineSegment, private l2: LineSegment) {
    super();
    this.l1 = l1;
    this.l2 = l2;
  }

  // Squared distance between the two endpoints
  value(allPoints: number[]): number {
    const l1p2 = this.l1.p2;
    const l2p1 = this.l2.p1;
    return (allPoints[l1p2.xi] - allPoints[l2p1.xi]) ** 2 + (allPoints[l1p2.yi] - allPoints[l2p1.yi]) ** 2;
  }

  gradient(allPoints: number[], gradOut: number[]): void {
    const l1p2 = this.l1.p2;
    const l2p1 = this.l2.p1;
    gradOut[l1p2.xi] += 2 * (allPoints[l1p2.xi] - allPoints[l2p1.xi]);
    gradOut[l1p2.yi] += 2 * (allPoints[l1p2.yi] - allPoints[l2p1.yi]);
    gradOut[l2p1.xi] -= 2 * (allPoints[l1p2.xi] - allPoints[l2p1.xi]);
    gradOut[l2p1.yi] -= 2 * (allPoints[l1p2.yi] - allPoints[l2p1.yi]);
  }
}

export class FixedPoint extends Constraint {
  constructor(private p: Point, private x: number, private y: number) {
    super();
    this.p = p;
    this.x = x;
    this.y = y;
  }

  value(allPoints: number[]): number {
    return (allPoints[this.p.xi] - this.x) ** 2 + (allPoints[this.p.yi] - this.y) ** 2;
  }

  gradient(allPoints: number[], gradOut: number[]): void {
    gradOut[this.p.xi] += 2 * (allPoints[this.p.xi] - this.x);
    gradOut[this.p.yi] += 2 * (allPoints[this.p.yi] - this.y);
  }
}

