import { Vector2 } from "three";

export namespace Geometry {
  export abstract class Element {
    // The offset of this element in the global state vector
    constructor(protected offset: number) { }

    // Number of degrees of freedom for this element
    abstract dims(): number;

    // Copy this elements state into a global state vector
    abstract assembleState(state: number[], offset: number): void;

    // Update this elements state from a global state vector
    abstract updateFromState(state: number[], offset: number): void;
  }

  export class Point extends Element {
    constructor(public v: Vector2, offset: number) { super(offset) }

    dims(): number {
      return 2;
    }

    assembleState(state: number[], offset: number): void {
      state[offset] = this.v.x;
      state[offset + 1] = this.v.y;
    }

    updateFromState(state: number[], offset: number): void {
      this.v.x = state[offset];
      this.v.y = state[offset + 1];
    }

    x(state: number[]): number {
      return state[this.offset];
    }

    y(state: number[]): number {
      return state[this.offset + 1];
    }
  }

  export class LineSegment {
    constructor(public p1: Point, public p2: Point) { }

    dims(): number {
      return this.p1.dims() + this.p2.dims();
    }

    assembleState(state: number[], offset: number): void {
      this.p1.assembleState(state, offset);
      this.p2.assembleState(state, offset + this.p1.dims());
    }

    updateFromState(state: number[], offset: number): void {
      this.p1.updateFromState(state, offset);
      this.p2.updateFromState(state, offset + this.p1.dims());
    }
  }

  export class Arc {

  }
}