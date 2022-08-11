import { Constraint } from "./Constraints";
import { minimize_L_BFGS } from "./LBFGS"
import optimjs from "optimization-js"

export default class ConstraintSolver {
  constructor(private constraints: Constraint[]) {
  }

  value(state: number[]): number {
    let sum = 0;
    for (const constraint of this.constraints) {
      sum += constraint.value(state);
    }
    return sum;
  }

  gradient(state: number[]): number[] {
    let grad: number[] = Array(state.length).fill(0);
    for (const constraint of this.constraints) {
      constraint.gradient(state, grad);
    }
    return grad;
  }

  solve(state: number[]): number[] {
    return this.solve_lbfgs(state);
    // return this.solve_gradient_descent(state);
  }

  solve_lbfgs(state: number[]): number[] {
    let x = [...state];

    const f = (x: number[]) => this.value(x);
    const fp = (x: number[]) => this.gradient(x);
    const sol = minimize_L_BFGS(f, fp, x);
    console.log("sol: ", sol);
    return sol.argument;
  }

  solve_gradient_descent(state: number[]): number[] {
    let x = [...state];
    let grad = this.gradient(x);
    let prevValue = this.value(x);
    let prevGrad = grad;
    let prevX = x;
    let prevGradNorm = Math.sqrt(grad.reduce((a, b) => a + b ** 2, 0));
    let i = 0;
    while (i < 500) {
      const gradNorm = Math.sqrt(grad.reduce((a, b) => a + b ** 2, 0));
      const alpha = prevValue / (prevGradNorm ** 2);
      x = prevX.map((v, i) => v - alpha * grad[i]);
      grad = this.gradient(x);
      const value = this.value(x);
      console.log("iteration:", i);
      console.log("prevGradNorm:", prevGradNorm);
      console.log("alpha:", alpha);
      console.log("grad:", grad);
      console.log("prevValue:", prevValue);
      console.log("value:", value);
      if (value < prevValue) {
        prevValue = value;
        prevGrad = grad;
        prevX = x;
        prevGradNorm = gradNorm;
      } else {
        x = prevX;
        grad = prevGrad;
        break;
      }
      i++;
    }
    return x;
  }
}