import { Vector2 } from "three";

export namespace Geometry {
  export abstract class Element {
    // Offset into the the global state vector
    constructor(protected offset: number) { }

    // Number of degrees of freedom for this element
    abstract dims(): number;
  }

  export enum LineEndPoint {
    P1 = 0,
    P2 = 1,
  }

  export function otherEnd(end: LineEndPoint): LineEndPoint {
    return end === LineEndPoint.P1 ? LineEndPoint.P2 : LineEndPoint.P1;
  }


  export class LineSegment extends Element {
    constructor(x1: number, y1: number, x2: number, y2: number, state: number[], offset: number) {
      super(offset);
      this.setP1(state, x1, y1);
      this.setP2(state, x2, y2);
    }

    static dims(): number {
      return 4;
    }

    // Annoyingly seems like typescript doesn't support abstract static methods
    dims(): number {
      return LineSegment.dims();
    }

    x1(state: number[]): number {
      return state[this.x1i()];
    }
    y1(state: number[]): number {
      return state[this.y1i()];
    }
    x2(state: number[]): number {
      return state[this.x2i()];
    }
    y2(state: number[]): number {
      return state[this.y2i()];
    }

    x1i(): number {
      return this.offset;
    }
    y1i(): number {
      return this.offset + 1;
    }
    x2i(): number {
      return this.offset + 2;
    }
    y2i(): number {
      return this.offset + 3;
    }

    xi(lineEndPoint: LineEndPoint): number {
      if (lineEndPoint === LineEndPoint.P1) {
        return this.x1i();
      } else if (lineEndPoint === LineEndPoint.P2) {
        return this.x2i();
      } else {
        throw "Point index must be 0 or 1";
      }
    }

    yi(lineEndPoint: LineEndPoint): number {
      if (lineEndPoint === LineEndPoint.P1) {
        return this.y1i();
      } else if (lineEndPoint === LineEndPoint.P2) {
        return this.y2i();
      } else {
        throw "Point index must be 0 or 1";
      }
    }

    x(state: number[], lineEndPoint: LineEndPoint): number {
      if (lineEndPoint === LineEndPoint.P1) {
        return this.x1(state);
      } else if (lineEndPoint === LineEndPoint.P2) {
        return this.x2(state);
      } else {
        throw "Point index must be 0 or 1";
      }
    }

    y(state: number[], lineEndPoint: LineEndPoint): number {
      if (lineEndPoint === LineEndPoint.P1) {
        return this.y1(state);
      } else if (lineEndPoint === LineEndPoint.P2) {
        return this.y2(state);
      } else {
        throw "Point index must be 0 or 1";
      }
    }

    setP1(state: number[], x1: number, y1: number) {
      state[this.x1i()] = x1;
      state[this.y1i()] = y1;
    }

    setP2(state: number[], x2: number, y2: number) {
      state[this.x2i()] = x2;
      state[this.y2i()] = y2;
    }

    set(state: number[], lineEndPoint: LineEndPoint, x: number, y: number) {
      if (lineEndPoint === LineEndPoint.P1) {
        this.setP1(state, x, y);
      } else if (lineEndPoint === LineEndPoint.P2) {
        this.setP2(state, x, y);
      } else {
        throw "Point index must be 0 or 1";
      }
    }
  }

  export enum ArcEndPoint {
    START = 0,
    END = 1
  }

  export function otherEndArc(end: ArcEndPoint): ArcEndPoint {
    return end === ArcEndPoint.START ? ArcEndPoint.END : ArcEndPoint.START;
  }

  export class Arc extends Element {
    constructor(x: number, y: number, radius: number, startAngle: number, endAngle: number, state: number[], offset: number) {
      super(offset);
      this.setX(state, x);
      this.setY(state, y);
      this.setRadius(state, radius);
      this.setStartAngle(state, startAngle);
      this.setEndAngle(state, endAngle);
    }

    static dims(): number {
      return 5;
    }

    // Annoyingly seems like typescript doesn't support abstract static methods
    dims(): number {
      return Arc.dims();
    }

    x(state: number[]): number {
      return state[this.xi()];
    }
    y(state: number[]): number {
      return state[this.yi()];
    }
    radius(state: number[]): number {
      return state[this.radiusi()];
    }
    startAngle(state: number[]): number {
      return state[this.startAnglei()];
    }
    endAngle(state: number[]): number {
      return state[this.endAnglei()];
    }
    angle(state: number[], arcEndPoint: ArcEndPoint): number {
      if (arcEndPoint === ArcEndPoint.START) {
        return this.startAngle(state);
      } else if (arcEndPoint === ArcEndPoint.END) {
        return this.endAngle(state);
      } else {
        throw "Arc end point index must be 0 or 1";
      }
    }

    xi(): number {
      return this.offset;
    }
    yi(): number {
      return this.offset + 1;
    }
    radiusi(): number {
      return this.offset + 2;
    }
    startAnglei(): number {
      return this.offset + 3;
    }
    endAnglei(): number {
      return this.offset + 4;
    }
    anglei(arcEndPoint: ArcEndPoint): number {
      if (arcEndPoint === ArcEndPoint.START) {
        return this.startAnglei();
      } else if (arcEndPoint === ArcEndPoint.END) {
        return this.endAnglei();
      } else {
        throw "Arc end point index must be 0 or 1";
      }
    }


    setX(state: number[], x: number) {
      state[this.xi()] = x;
    }
    setY(state: number[], y: number) {
      state[this.yi()] = y;
    }
    setRadius(state: number[], radius: number) {
      state[this.radiusi()] = radius;
    }
    setStartAngle(state: number[], startAngle: number) {
      state[this.startAnglei()] = startAngle;
    }
    setEndAngle(state: number[], endAngle: number) {
      state[this.endAnglei()] = endAngle;
    }
  }

}