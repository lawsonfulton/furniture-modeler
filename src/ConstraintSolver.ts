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

// {
//   let vars = [1, 2, 3, 4, 5, 6, 7, 8]

//   let points: Point[] = [];
//   for (let i = 0; i < vars.length - 1; i += 2) {
//     points.push(new Point(i, i + 1));
//   }
//   console.log(points)
//   const lines = [
//     new LineSegment(points[0], points[1]),
//     new LineSegment(points[2], points[3]),
//   ]

//   const constraints: Constraint[] = [
//     new FixedPoint(points[0], 0, 0),
//     new FixedPoint(points[3], 10, 10),
//     new LinesIncident(lines[0], lines[1])
//   ];
//   console.log("constraints[0] value =", constraints[0].value(vars));
//   const grad0 = Array(vars.length).fill(0);
//   constraints[0].gradient(vars, grad0);
//   console.log("constraints[0] grad =", grad0);

//   console.log("constraints[1] value =", constraints[1].value(vars));
//   const grad1 = Array(vars.length).fill(0);
//   constraints[1].gradient(vars, grad1);
//   console.log("constraints[1] grad =", grad1);

//   console.log("constraints[2] value =", constraints[2].value(vars));
//   const grad2 = Array(vars.length).fill(0);
//   constraints[2].gradient(vars, grad2);
//   console.log("constraints[2] grad =", grad2);

//   const solver = new Solver(vars.length, constraints);
//   const sol = solver.solve(vars);
//   console.log("sol", sol);
// }