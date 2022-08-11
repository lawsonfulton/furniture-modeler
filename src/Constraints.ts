import { Geometry } from "./GeometryElements";
const sin = Math.sin;
const cos = Math.cos;
const sqrt = Math.sqrt;
const PI = Math.PI;

export abstract class Constraint {
  // Objective function value for this constraint as a function of the
  // entire state vector.
  // Function that we we can minimize (square of expression)
  abstract value(state: number[]): number;

  // Note that gradOut is of dimension state.length
  // it will be zero initialized and result must be *added* to it
  abstract gradient(state: number[], gradOut: number[]): void;
}

export class LineArcTangent extends Constraint {
  constructor(
    private seg: Geometry.LineSegment,
    private arc: Geometry.Arc,
    private arcEndPoint: Geometry.ArcEndPoint) {
    super();
  }

  value(state: number[]): number {
    const p1x = this.seg.x1(state);
    const p1y = this.seg.y1(state);
    const p2x = this.seg.x2(state);
    const p2y = this.seg.y2(state);
    const r = this.arc.radius(state);
    const theta = this.arc.angle(state, this.arcEndPoint);

    // old
    // return (r * sin(theta) * (p2x - p1x) - r * cos(theta) * (p2y - p1y) - sqrt((r * sin(theta)) ** 2 + (r * cos(theta)) ** 2) * sqrt((p2x - p1x) ** 2 + (p2y - p1y) ** 2)) ** 2;

    console.log("p1x: ", p1x);
    console.log("p1y: ", p1y);
    console.log("p2x: ", p2x);
    console.log("p2y: ", p2y);
    console.log("r: ", r);
    console.log("theta: ", theta);


    const val = 1.0 * (r * cos(theta) * (p2x - p1x) + r * sin(theta) * (p2y - p1y)) ** 2;
    console.log("val: ", val);
    return val;

  }

  gradient(state: number[], gradOut: number[]): void {
    const p1x = this.seg.x1(state);
    const p1xi = this.seg.x1i();
    const p1y = this.seg.y1(state);
    const p1yi = this.seg.y1i();
    const p2x = this.seg.x2(state);
    const p2xi = this.seg.x2i();
    const p2y = this.seg.y2(state);
    const p2yi = this.seg.y2i();
    const r = this.arc.radius(state);
    const ri = this.arc.radiusi();
    const theta = this.arc.angle(state, this.arcEndPoint);
    const thetai = this.arc.anglei(this.arcEndPoint);

    // old
    // gradOut[p1xi] += (-2 * r * sin(theta) - 2 * (p1x - p2x) * sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    // gradOut[p1yi] += (2 * r * cos(theta) - 2 * (p1y - p2y) * sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    // gradOut[p2xi] += (2 * r * sin(theta) - 2 * (-p1x + p2x) * sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    // gradOut[p2yi] += (-2 * r * cos(theta) - 2 * (-p1y + p2y) * sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    // gradOut[ri] += (2 * (-p1x + p2x) * sin(theta) + 2 * (p1y - p2y) * cos(theta) - 2 * (r * sin(theta) ** 2 + r * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) / sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    // gradOut[thetai] += (2 * r * (-p1x + p2x) * cos(theta) + 2 * r * (-p1y + p2y) * sin(theta)) * (r * (-p1x + p2x) * sin(theta) - r * (-p1y + p2y) * cos(theta) - sqrt(r ** 2 * sin(theta) ** 2 + r ** 2 * cos(theta) ** 2) * sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));



    gradOut[p1xi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)) * cos(theta));
    gradOut[p1yi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)) * sin(theta));
    gradOut[p2xi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)) * cos(theta));
    gradOut[p2yi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)) * sin(theta));
    gradOut[ri] += 1.0 * ((2 * (-p1x + p2x) * cos(theta) + 2 * (-p1y + p2y) * sin(theta)) * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)));
    gradOut[thetai] += 1.0 * ((-2 * r * (-p1x + p2x) * sin(theta) + 2 * r * (-p1y + p2y) * cos(theta)) * (r * (-p1x + p2x) * cos(theta) + r * (-p1y + p2y) * sin(theta)));


  }
}

// Keep a line segment aligned to its initial vector
export class LineSegmentAligned extends Constraint {
  // Normalized initial vector of line seg
  vx: number;
  vy: number;

  constructor(
    state: number[], private seg: Geometry.LineSegment) {
    super();
    const vx = seg.x2(state) - seg.x1(state);
    const vy = seg.y2(state) - seg.y1(state);
    this.vx = vx / Math.sqrt(vx * vx + vy * vy);
    this.vy = vy / Math.sqrt(vx * vx + vy * vy);
    console.log("vx: ", this.vx);
    console.log("vy: ", this.vy);
  }

  value(state: number[]): number {
    const p1x = this.seg.x1(state);
    const p1y = this.seg.y1(state);
    const p2x = this.seg.x2(state);
    const p2y = this.seg.y2(state);
    const vx = this.vx;
    const vy = this.vy;


    // const len = sqrt((p2x - p1x) ** 2 + (p2y - p1y) ** 2);
    // const dot = ((p2x - p1x) / len) * vx + ((p2y - p1y) / len) * vy;
    // const val = (dot - 1) ** 2;
    // // console.log("acos:", Math.acos(dot) * 180 / Math.PI);
    // console.log("p1x: " + p1x + " p1y: " + p1y + " p2x: " + p2x + " p2y: " + p2y + " vx: " + vx + " vy: " + vy + " len: " + len + " val: " + val);
    // console.log("dot:", dot);
    // console.log("len:", len);
    // console.log("val:", val);

    // One more time
    const val = (((p2x - p1x) * vx + (p2y - p1y) * vy) ** 2 - (p2x - p1x) ** 2 - (p2y - p1y) ** 2) ** 2;
    const l = ((p2x - p1x) * vx + (p2y - p1y) * vy);
    const r = ((p2x - p1x) * vx + (p2y - p1y) * vy) ** 2;
    console.log("((p2x - p1x) * vx + (p2y - p1y) * vy): ", l);
    console.log("((p2x - p1x) * vx + (p2y - p1y) * vy) ** 2: ", r);
    console.log("l-r: ", l - r);
    console.log("(l-r)**2: ", (l - r) ** 2);
    console.log("(p2x - p1x) ** 2 + (p2y - p1y) ** 2: ", ((p2x - p1x) ** 2 + (p2y - p1y) ** 2));

    console.log("aligned val:", val);
    console.log("p1x: ", p1x);
    console.log("p1y: ", p1y);
    console.log("p2x: ", p2x);
    console.log("p2y: ", p2y);
    console.log("vx: ", vx);
    console.log("vy: ", vy);
    const len = Math.sqrt((p2x - p1x) ** 2 + (p2y - p1y) ** 2);
    console.log("len: ", len);

    return val; 
  }

  gradient(state: number[], gradOut: number[]): void {
    const p1x = this.seg.x1(state);
    const p1xi = this.seg.x1i();
    const p1y = this.seg.y1(state);
    const p1yi = this.seg.y1i();
    const p2x = this.seg.x2(state);
    const p2xi = this.seg.x2i();
    const p2y = this.seg.y2(state);
    const p2yi = this.seg.y2i();
    const vx = this.vx;
    const vy = this.vy;

    gradOut[p1xi] += (-4 * p1x + 4 * p2x - 4 * vx * (vx * (-p1x + p2x) + vy * (-p1y + p2y))) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (vx * (-p1x + p2x) + vy * (-p1y + p2y)) ** 2);
    gradOut[p1yi] += (-4 * p1y + 4 * p2y - 4 * vy * (vx * (-p1x + p2x) + vy * (-p1y + p2y))) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (vx * (-p1x + p2x) + vy * (-p1y + p2y)) ** 2);
    gradOut[p2xi] += (4 * p1x - 4 * p2x + 4 * vx * (vx * (-p1x + p2x) + vy * (-p1y + p2y))) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (vx * (-p1x + p2x) + vy * (-p1y + p2y)) ** 2);
    gradOut[p2yi] += (4 * p1y - 4 * p2y + 4 * vy * (vx * (-p1x + p2x) + vy * (-p1y + p2y))) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (vx * (-p1x + p2x) + vy * (-p1y + p2y)) ** 2);
  }
}

export class LineSegmentFixedPoint extends Constraint {
  x: number;
  y: number;
  constructor(state: number[], private seg: Geometry.LineSegment, private lineEndPoint: Geometry.LineEndPoint) {
    super();
    this.x = seg.x(state, lineEndPoint);
    this.y = seg.y(state, lineEndPoint);
  }

  value(state: number[]): number {
    const px = this.seg.x(state, this.lineEndPoint);
    const py = this.seg.y(state, this.lineEndPoint);
    return (px - this.x) ** 2 + (py - this.y) ** 2;
  }

  gradient(state: number[], gradOut: number[]): void {
    const px = this.seg.x(state, this.lineEndPoint);
    const pxi = this.seg.xi(this.lineEndPoint);
    const py = this.seg.y(state, this.lineEndPoint);
    const pyi = this.seg.yi(this.lineEndPoint);
    gradOut[pxi] += 2 * (px - this.x);
    gradOut[pyi] += 2 * (py - this.y);
  }
}

export class LineArcIncident extends Constraint {
  constructor(
    private seg: Geometry.LineSegment,
    private lineEndPoint: Geometry.LineEndPoint,
    private arc: Geometry.Arc,
    private arcEndPoint: Geometry.ArcEndPoint) {
    super();
  }  

  value(state: number[]): number {
    const px = this.seg.x(state, this.lineEndPoint);
    const py = this.seg.y(state, this.lineEndPoint);
    const ax = this.arc.x(state);
    const ay = this.arc.y(state);
    const sa = this.arc.angle(state, this.arcEndPoint);
    const r = this.arc.radius(state);

    // let lam = 0;
    // // if (sa < 0) {
    // //   lam = -(sa ** 2);  
    // // }
    const dx = r * cos(sa) + ax - px;
    const dy = r * sin(sa) + ay - py
    return dx ** 2 + dy ** 2;

    return (r * cos(sa) + ax - px) ** 2 + (r * sin(sa) + ay - py) ** 2;
  }  

  gradient(state: number[], gradOut: number[]): void {
    const px = this.seg.x(state, this.lineEndPoint);
    const pxi = this.seg.xi(this.lineEndPoint);
    const py = this.seg.y(state, this.lineEndPoint);
    const pyi = this.seg.yi(this.lineEndPoint);
    const sa = this.arc.angle(state, this.arcEndPoint);
    const sai = this.arc.anglei(this.arcEndPoint);
    const r = this.arc.radius(state);
    const ri = this.arc.radiusi();
    const ax = this.arc.x(state);
    const axi = this.arc.xi();
    const ay = this.arc.y(state);
    const ayi = this.arc.yi();

    let lam = 0;
    // if (sa < 0) {
    //   lam = -2 * sa;  
    // }

    // old
    // const dx = r * cos(sa) + ax - px;
    // const dy = r * sin(sa) + ay - py

    // gradOut[axi] += 2 * dx;
    // gradOut[ayi] += 2 * dy;
    // gradOut[pxi] += -2 * dx;
    // gradOut[pyi] += -2 * dy;
    // gradOut[ri] += 2 * cos(sa) * dx + 2 * sin(sa) * dy;
    // gradOut[sai] += 2 * r * cos(sa) * dy - 2 * r * sin(sa) * dx;

    gradOut[axi] += 2 * ax - 2 * px + 2 * r * cos(sa);
    gradOut[ayi] += 2 * ay - 2 * py + 2 * r * sin(sa);
    gradOut[pxi] += -2 * ax + 2 * px - 2 * r * cos(sa);
    gradOut[pyi] += -2 * ay + 2 * py - 2 * r * sin(sa);
    gradOut[ri] += 2 * (ax - px + r * cos(sa)) * cos(sa) + 2 * (ay - py + r * sin(sa)) * sin(sa);
    gradOut[sai] += -2 * r * (ax - px + r * cos(sa)) * sin(sa) + 2 * r * (ay - py + r * sin(sa)) * cos(sa);
  }
}  

export class FixedArcRadius extends Constraint {
  // point 2 of l1 incident to point 1 of l2
  constructor(private arc: Geometry.Arc, private radius: number) {
    super();
  }  

  value(state: number[]): number {
    return (this.arc.radius(state) - this.radius) ** 2;
  }  

  gradient(state: number[], gradOut: number[]): void {
    gradOut[this.arc.radiusi()] += 2 * (this.arc.radius(state) - this.radius);
  }
}  

