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
    private lineEndPoint: Geometry.LineEndPoint,
    private arc: Geometry.Arc,
    private arcEndPoint: Geometry.ArcEndPoint,
    private reverse: boolean) {
    super();
  }

  value(state: number[]): number {
    const p1x = this.seg.x(state, this.lineEndPoint);
    const p1y = this.seg.y(state, this.lineEndPoint);
    const p2x = this.seg.x(state, Geometry.otherEnd(this.lineEndPoint));
    const p2y = this.seg.y(state, Geometry.otherEnd(this.lineEndPoint));
    const sa = this.arc.angle(state, this.arcEndPoint);
    const ea = this.arc.angle(state, Geometry.otherEndArc(this.arcEndPoint));
    const r = this.arc.radius(state);

    // Good
    // const val = (r * cos(sa) * (p2x - p1x) + r * sin(sa) * (p2y - p1y)) ** 2;

    // Hack to try and make the upside down arcs work..
    if (!(this.reverse)) {
      const val = (r * cos(sa) * (p2x - p1x) + r * sin(sa) * (p2y - p1y)) ** 2;
      return val;
    } else {
      const val = (r * cos(ea) * (p2x - p1x) + r * sin(ea) * (p2y - p1y)) ** 2;
      return val;
    }

    //////////////// Vector aligned version (not quite right?)
    // const p1x = this.seg.x(state, this.lineEndPoint);
    // const p1y = this.seg.y(state, this.lineEndPoint);
    // const p2x = this.seg.x(state, Geometry.otherEnd(this.lineEndPoint));
    // const p2y = this.seg.y(state, Geometry.otherEnd(this.lineEndPoint));
    // const sa = this.arc.angle(state, this.arcEndPoint);
    // const ea = this.arc.angle(state, Geometry.otherEndArc(this.arcEndPoint));

    // let val = 0;
    // if (this.arcEndPoint === Geometry.ArcEndPoint.START) {
    //   val = (((p2x - p1x) * sin(sa) + (p2y - p1y) * -cos(sa)) ** 2 - (p2x - p1x) ** 2 - (p2y - p1y) ** 2) ** 2;
    // } else {
    //   val = (((p2x - p1x) * -sin(ea) + (p2y - p1y) * cos(ea)) ** 2 - (p2x - p1x) ** 2 - (p2y - p1y) ** 2) ** 2;
    // }
    // return val;

  }

  gradient(state: number[], gradOut: number[]): void {
    const p1x = this.seg.x(state, this.lineEndPoint);
    const p1xi = this.seg.xi(this.lineEndPoint);
    const p1y = this.seg.y(state, this.lineEndPoint);
    const p1yi = this.seg.yi(this.lineEndPoint);
    const p2x = this.seg.x(state, Geometry.otherEnd(this.lineEndPoint));
    const p2xi = this.seg.xi(Geometry.otherEnd(this.lineEndPoint));
    const p2y = this.seg.y(state, Geometry.otherEnd(this.lineEndPoint));
    const p2yi = this.seg.yi(Geometry.otherEnd(this.lineEndPoint));
    const sa = this.arc.angle(state, this.arcEndPoint);
    const sai = this.arc.anglei(this.arcEndPoint);
    const ea = this.arc.angle(state, Geometry.otherEndArc(this.arcEndPoint));
    const eai = this.arc.anglei(Geometry.otherEndArc(this.arcEndPoint));
    const r = this.arc.radius(state);
    const ri = this.arc.radiusi();

    // Good
    if (!(this.reverse)) {
      gradOut[p1xi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)) * cos(sa));
      gradOut[p1yi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)) * sin(sa));
      // gradOut[p2xi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)) * cos(sa));
      // gradOut[p2yi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)) * sin(sa));
      gradOut[ri] += 1.0 * ((2 * (-p1x + p2x) * cos(sa) + 2 * (-p1y + p2y) * sin(sa)) * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)));
      gradOut[sai] += 1.0 * ((-2 * r * (-p1x + p2x) * sin(sa) + 2 * r * (-p1y + p2y) * cos(sa)) * (r * (-p1x + p2x) * cos(sa) + r * (-p1y + p2y) * sin(sa)));
    } else {
      gradOut[p1xi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)) * cos(ea));
      gradOut[p1yi] += 1.0 * (-2 * r * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)) * sin(ea));
      // gradOut[p2xi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)) * cos(ea));
      // gradOut[p2yi] += 1.0 * (2 * r * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)) * sin(ea));
      gradOut[ri] += 1.0 * ((2 * (-p1x + p2x) * cos(ea) + 2 * (-p1y + p2y) * sin(ea)) * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)));
      gradOut[eai] += 1.0 * ((-2 * r * (-p1x + p2x) * sin(ea) + 2 * r * (-p1y + p2y) * cos(ea)) * (r * (-p1x + p2x) * cos(ea) + r * (-p1y + p2y) * sin(ea)));
    }

    //////////////// Vector aligned version (not quite right?)
    // const p1x = this.seg.x(state, this.lineEndPoint);
    // const p1xi = this.seg.xi(this.lineEndPoint);
    // const p1y = this.seg.y(state, this.lineEndPoint);
    // const p1yi = this.seg.yi(this.lineEndPoint);
    // const p2x = this.seg.x(state, Geometry.otherEnd(this.lineEndPoint));
    // const p2xi = this.seg.xi(Geometry.otherEnd(this.lineEndPoint));
    // const p2y = this.seg.y(state, Geometry.otherEnd(this.lineEndPoint));
    // const p2yi = this.seg.yi(Geometry.otherEnd(this.lineEndPoint));
    // const sa = this.arc.angle(state, this.arcEndPoint);
    // const sai = this.arc.anglei(this.arcEndPoint);
    // const ea = this.arc.angle(state, Geometry.otherEndArc(this.arcEndPoint));
    // const eai = this.arc.anglei(Geometry.otherEndArc(this.arcEndPoint));

    // if (this.arcEndPoint === Geometry.ArcEndPoint.START) {
    //   // gradOut[p1xi] += -2 * (-p1x + p2x) * (-p1y + p2y) * (-(-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - cos(sa)) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + (-(-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + sin(sa)) * (-2 * (-p1x + p2x) ** 2 / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + 2 / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p1yi] += -2 * (-p1x + p2x) * (-p1y + p2y) * (-(-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + sin(sa)) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + (-(-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - cos(sa)) * (-2 * (-p1y + p2y) ** 2 / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + 2 / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p2xi] += -2 * (p1x - p2x) * (-p1y + p2y) * (-(-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - cos(sa)) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + (-(-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + sin(sa)) * (-2 * (-p1x + p2x) * (p1x - p2x) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) - 2 / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p2yi] += -2 * (-p1x + p2x) * (p1y - p2y) * (-(-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + sin(sa)) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) + (-(-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - cos(sa)) * (-2 * (-p1y + p2y) * (p1y - p2y) / ((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) ** (3 / 2) - 2 / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[sai] += 2 * (-(-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + sin(sa)) * cos(sa) + 2 * (-(-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - cos(sa)) * sin(sa);
    //   gradOut[p1xi] += (-4 * p1x + 4 * p2x - 4 * ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) * sin(sa)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) ** 2);
    //   gradOut[p1yi] += (-4 * p1y + 4 * p2y + 4 * ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) * cos(sa)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) ** 2);
    //   gradOut[p2xi] += (4 * p1x - 4 * p2x + 4 * ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) * sin(sa)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) ** 2);
    //   gradOut[p2yi] += (4 * p1y - 4 * p2y - 4 * ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) * cos(sa)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) ** 2);
    //   gradOut[sai] += 2 * ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) * (2 * (-p1x + p2x) * cos(sa) - 2 * (p1y - p2y) * sin(sa)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + ((-p1x + p2x) * sin(sa) - (-p1y + p2y) * cos(sa)) ** 2);
    // } else {
    //   // gradOut[p1xi] += (-2 * (p1x - p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + 2 * sin(ea - 2 * PI)) * (-(-p1x + p2x) * sin(ea - 2 * PI) - (-p1y + p2y) * cos(ea - 2 * PI) - sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p1yi] += (-2 * (p1y - p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) + 2 * cos(ea - 2 * PI)) * (-(-p1x + p2x) * sin(ea - 2 * PI) - (-p1y + p2y) * cos(ea - 2 * PI) - sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p2xi] += (-2 * (-p1x + p2x) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - 2 * sin(ea - 2 * PI)) * (-(-p1x + p2x) * sin(ea - 2 * PI) - (-p1y + p2y) * cos(ea - 2 * PI) - sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[p2yi] += (-2 * (-p1y + p2y) / sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2) - 2 * cos(ea - 2 * PI)) * (-(-p1x + p2x) * sin(ea - 2 * PI) - (-p1y + p2y) * cos(ea - 2 * PI) - sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   // gradOut[eai] += (2 * (p1x - p2x) * cos(ea - 2 * PI) - 2 * (p1y - p2y) * sin(ea - 2 * PI)) * (-(-p1x + p2x) * sin(ea - 2 * PI) - (-p1y + p2y) * cos(ea - 2 * PI) - sqrt((-p1x + p2x) ** 2 + (-p1y + p2y) ** 2));
    //   gradOut[p1xi] += (-4 * p1x + 4 * p2x + 4 * (-(-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) * sin(ea)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) ** 2);
    //   gradOut[p1yi] += (-4 * p1y + 4 * p2y - 4 * (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) * cos(ea)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) ** 2);
    //   gradOut[p2xi] += (4 * p1x - 4 * p2x - 4 * (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) * sin(ea)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) ** 2);
    //   gradOut[p2yi] += (4 * p1y - 4 * p2y + 4 * (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) * cos(ea)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) ** 2);
    //   gradOut[eai] += 2 * (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) * (2 * (p1x - p2x) * cos(ea) - 2 * (-p1y + p2y) * sin(ea)) * (-1.0 * (-p1x + p2x) ** 2 - (-p1y + p2y) ** 2 + (-1.0 * (-p1x + p2x) * sin(ea) + (-p1y + p2y) * cos(ea)) ** 2);
    // }
  }
}

// Keep a line segment aligned to its initial vector
export class LineSegmentAligned extends Constraint {
  // Normalized initial vector of line seg
  vx: number;
  vy: number;
  pox: number;
  poy: number;

  constructor(
    state: number[], private seg: Geometry.LineSegment) {
    super();
    const vx = seg.x2(state) - seg.x1(state);
    const vy = seg.y2(state) - seg.y1(state);
    this.vx = vx / Math.sqrt(vx * vx + vy * vy);
    this.vy = vy / Math.sqrt(vx * vx + vy * vy);
    this.pox = seg.x1(state);
    this.poy = seg.y1(state);
  }

  value(state: number[]): number {
    const p1x = this.seg.x1(state);
    const p1y = this.seg.y1(state);
    const p2x = this.seg.x2(state);
    const p2y = this.seg.y2(state);
    const vx = this.vx;
    const vy = this.vy;
    const pox = this.pox;
    const poy = this.poy;

    const val = ((vx * (p1x - pox) + vy * (p1y - poy)) ** 2 - ((p1x - pox) ** 2 + (p1y - poy) ** 2)) ** 2 + ((vx * (p2x - pox) + vy * (p2y - poy)) ** 2 - ((p2x - pox) ** 2 + (p2y - poy) ** 2)) ** 2;
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
    const pox = this.pox;
    const poy = this.poy;

    // Point line distance
    gradOut[p1xi] += (-4 * p1x + 4 * pox + 4 * vx * (vx * (p1x - pox) + vy * (p1y - poy))) * (-1.0 * (p1x - pox) ** 2 - (p1y - poy) ** 2 + (vx * (p1x - pox) + vy * (p1y - poy)) ** 2);
    gradOut[p1yi] += (-4 * p1y + 4 * poy + 4 * vy * (vx * (p1x - pox) + vy * (p1y - poy))) * (-1.0 * (p1x - pox) ** 2 - (p1y - poy) ** 2 + (vx * (p1x - pox) + vy * (p1y - poy)) ** 2);
    gradOut[p2xi] += (-4 * p2x + 4 * pox + 4 * vx * (vx * (p2x - pox) + vy * (p2y - poy))) * (-1.0 * (p2x - pox) ** 2 - (p2y - poy) ** 2 + (vx * (p2x - pox) + vy * (p2y - poy)) ** 2);
    gradOut[p2yi] += (-4 * p2y + 4 * poy + 4 * vy * (vx * (p2x - pox) + vy * (p2y - poy))) * (-1.0 * (p2x - pox) ** 2 - (p2y - poy) ** 2 + (vx * (p2x - pox) + vy * (p2y - poy)) ** 2);
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

    const dx = r * cos(sa) + ax - px;
    const dy = r * sin(sa) + ay - py
    return dx ** 2 + dy ** 2;
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

