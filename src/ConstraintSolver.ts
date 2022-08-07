import { Constraint } from "./Constraints";

export default class ConstraintSolver {
  constructor(private constraints: Constraint[]) {
    this.constraints = constraints;
  }

  value(allPoints: number[]): number {
    let sum = 0;
    for (const constraint of this.constraints) {
      sum += constraint.value(allPoints); // ** 2
    }
    return sum;
  }

  gradient(allPoints: number[]): number[] {
    // TODO my gradient is wrong because I'm summing over squares 
    // Do I need to sum over squares? unclear.
    let grad: number[] = Array(allPoints.length).fill(0);
    for (const constraint of this.constraints) {
      constraint.gradient(allPoints, grad);
    }
    return grad;
  }

  solve(allPoints: number[]): number[] {
    // TODO check this code and need to find out the name of this gradient descent algo
    let x = [...allPoints];
    let grad = this.gradient(x);
    let prevValue = this.value(x);
    let prevGrad = grad;
    let prevX = x;
    let prevGradNorm = Math.sqrt(grad.reduce((a, b) => a + b ** 2, 0));
    // let prevGradNorm = 0;
    let i = 0;
    while (i < 100) {
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