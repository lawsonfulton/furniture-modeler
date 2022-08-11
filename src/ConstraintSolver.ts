import { Constraint } from "./Constraints";
import { minimize_L_BFGS } from "./LBFGS"
import optimjs from "optimization-js"
// import "./nlopt/nlopt_gen";
// import nlopt from './nlopt/nlopt_gen.wasm?init'
// import 'nlopt-js'
// const nlopt = (await import("nlopt-js")).default


// declare function require(name: string);
// const nlopt = require('nlopt-js');//.appPromise;

export default class ConstraintSolver {
  constructor(private constraints: Constraint[]) {
  }

  value(state: number[]): number {
    let sum = 0;
    for (const constraint of this.constraints) {
      sum += constraint.value(state); // ** 2
    }
    return sum;
  }

  gradient(state: number[]): number[] {
    // TODO my gradient is wrong because I'm summing over squares 
    // Do I need to sum over squares? unclear.
    let grad: number[] = Array(state.length).fill(0);
    for (const constraint of this.constraints) {
      constraint.gradient(state, grad);
    }
    return grad;
  }

  scale: number = 1;//0.1;
  solve(state: number[]): number[] {
    let x = [...state];

    const f = (x: number[]) => this.value(x);
    const fp = (x: number[]) => this.gradient(x);
    const sol = minimize_L_BFGS(f, fp, x);
    console.log("sol: ", sol);
    return sol.argument;
  }

  solve2(state: number[]): number[] {
    // TODO check this code and need to find out the name of this gradient descent algo
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

  // solve(state: number[]): number[] {


  //   const f = (x: number[]) => this.value(x);
  //   const fp = (x: number[]) => this.gradient(x);
  //   // const sol = optimjs.minimize_L_BFGS(f, fp, state);
  //   const sol = optimjs.minimize_Powell(f, state);
  //   console.log("sol: ", sol);

  //   return sol.argument;
  // }

  // solve(state: number[]): number[] {

  //   // console.log(global)
  //   // console.log(window.nlopt)
  //   console.log(nlopt)
  //   console.log(nlopt.ready)
  //   console.log(nlopt.GC)
  //   // console.log(nlopt.ready)
  //   nlopt.ready.then(nlopt => {
  //     console.log(nlopt)

  //     console.log("going")
  //     let opt = nlopt.Optimize(nlopt.Algorithm.NLOPT_LD_LBFGS, state.length)
  //     opt.setMinObjective((x, grad) => {
  //       console.log(x)
  //       if (grad) {
  //         const newGrad = this.gradient(x);
  //         for (let i = 0; i < grad.length; i++) {
  //           grad[i] = newGrad[i];
  //         }
  //         return this.value(x);
  //       }
  //     }, 1e-4);
  //     const res = opt.optimize(state);
  //     for (let i = 0; i < state.length; i++) {
  //       state[i] = res[i];
  //     }
  //   });
  //   return state;
  // }

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