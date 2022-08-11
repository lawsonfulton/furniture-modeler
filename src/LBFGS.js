//
//
// NOTE: Sourced from: https://www.npmjs.com/package/optimize-js
// Not implemented by me!! Just some small modifications
//
//

/**
 * Minimize an unconstrained function using first order L-BFGS algorithm.
 * @param {function} fnc Function to be minimized. This function takes 
 * array of size N as an input, and returns a scalar value as output, 
 * which is to be minimized.
 * @param {function} grd A gradient function of the objective.
 * @param {Array} x0 An array of values of size N, which is an initialization
 *  to the minimization algorithm.
 * @return {Object} An object instance with two fields: argument, which 
 * denotes the best argument found thus far, and fncvalue, which is a
 * value of the function at the best found argument.
*/
export function minimize_L_BFGS(fnc, grd, x0) {
    // fnc: function which takes array of size N as an input
    // grd: gradient (array of size N) of function for some input
    // x0: array or real numbers of size N; 
    // serves as initialization of algorithm.

    // solution is a struct, with fields:
    // argument: solution argument
    // fncvalue: function value at found optimum
    var x = x0.slice();

    var eps = 1e-5; // max abs value of gradient component for termination
    var alpha = 0.001; // initial step size
    var m = 5; // history size to keep for Hessian approximation

    var pfx = fnc(x);
    var s = []; // this is needed for lbfgs procedure
    var y = [];
    var ro = [];

    var g = grd(x);
    var direction = g.slice();
    var convergence = false;
    var iter = 0;
    while (!convergence && iter < 1000) {
        console.log("x: " + x);
        console.log("f'(x): " + g);
        console.log("f(x): " + pfx);
        console.log("i: " + iter);
        iter += 1;

        var xn = x.slice();
        vect_x_pluseq_ag(xn, alpha, direction); // perform step
        var fx = fnc(xn);
        alpha = pfx < fx ? alpha * 0.5 : alpha * 1.2; // magic!

        //  < ================= apply limited memory BFGS procedure ================= >
        var gn = grd(xn);

        if (vect_max_abs_x_less_eps(gn, eps)) {
            break;
        }

        var dx = vect_a_minus_b(xn, x);
        var dg = vect_a_minus_b(gn, g);

        s.unshift(dx);
        y.unshift(dg);
        var tmp = 1 / (dot(dx, dg));
        ro.unshift(tmp);

        if (s.length > m) {
            s.pop();
            y.pop();
            ro.pop();
        }

        var r = g.slice();
        var a = new Array(s.length);

        for (var i = 0; i < s.length; i++) {
            var pi = 1 / (dot(s[i], y[i]));
            a[i] = pi * dot(s[i], r);
            vect_x_pluseq_ag(r, -a[i], y[i]);
        }

        // perform Hessian scaling
        var scale = dot(dx, dg) / dot(dg, dg);
        for (var i = 0; i < r.length; i++) {
            r[i] = r[i] * scale;
        }

        for (var i = 0; i < s.length; i++) {
            var j = s.length - i - 1;
            var pj = 1 / (dot(s[j], y[j]));
            var beta = pj * dot(y[j], r);
            vect_x_pluseq_ag(r, (a[j] - beta), s[j]);
        }
        direction = r.slice();

        //  < ================= apply limited memory BFGS procedure ================= >

        for (var i = 0; i < direction.length; i++) {
            direction[i] = -direction[i];
        }

        pfx = fx;
        x = xn;
        g = gn;

    }

    var solution = {};
    solution.argument = x;
    solution.fncvalue = fx;
    return solution;

}

/*module.exports.numerical_gradient = function (fnc, x) {
    // can be used as for gradient check or its substitute. Gradient is approx. via forward difference
    var grad = x.slice();
    var fx = fnc(x);
    var h = 1e-6; // step size

    for (var i = 0; i < x.length; i++) {

        // approximation using simple forward difference
        x[i] += h;
        var fxi = fnc(x);
        x[i] -= h;

        grad[i] = (fxi - fx) / h;
    }
    return grad;
};*/

/**
 * Shuffles indicies of arrray.
 * @ignore
 * @param {Array} array Array to shuffle.
 */
function shuffleIndiciesOf(array) {
    var idx = [];
    for (var i = 0; i < array.length; i++) {
        idx.push(i);
    }
    for (var i = 0; i < array.length; i++) {
        var j = Math.floor(Math.random() * i);
        var tmp = idx[i];
        idx[i] = idx[j];
        idx[j] = tmp;
    }
    return idx;
};

/**
 * Computes dot product.
 * @ignore
 * @param {Array} a First vector argument.
 * @param {Array} b Second vector argument.
 */
function dot(a, b) {
    var result = 0;
    for (var i = 0; i < a.length; i++) {
        result += a[i] * b[i];
    }
    return result;

};

/**
 * Substracts vectors.
 * @ignore
 * @param {Array} a First vector argument.
 * @param {Array} b Second vector argument.
 */
function vect_a_minus_b(a, b) {
    var result = new Array(a.length);
    for (var i = 0; i < a.length; i++) {
        result[i] = a[i] - b[i];
    }
    return result;

};

/**
 * Fixed step size updating value of x.
 * @ignore
 * @param {Array} x First vector argument.
 * @param {Number} a Step size.
 * @param {Array} g Gradient.
 */
function vect_x_pluseq_ag(x, a, g) {
    for (var i = 0; i < x.length; i++) {
        x[i] = x[i] + a * g[i];
    }

    return x;

};

/**
 * Checks whether absolute values in a vector are greater than 
 * some threshold.
 * @ignore
 * @param {Array} x Vector that is checked.
 * @param {Number} eps Threshold.
 */
function vect_max_abs_x_less_eps(x, eps) {
    // this procedure is used for stopping criterion check
    for (var i = 0; i < x.length; i++) {
        if (Math.abs(x[i]) >= eps) {
            return false;
        }
    }
    return true;
};