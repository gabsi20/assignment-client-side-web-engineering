/*
 * Implement a partial function. The function should return a variation of
 * the original function that can be invoked partially. Do also implement a
 * placeholder constant that can be used during invocation.
 *
 * - Works with an arbitrary length of arguments
 * - Works with an arbitrary number of placeholder elements!
 * - `partial` is a pure function!
 */
export const _ = undefined;

export function partial(fn, ...args) {
  const realArgs = args.filter( x => x !== undefined)
  console.log(fn.length, realArgs.length)
  if(fn.length >= realArgs.length) {
    realArgs.map(x => {
      console.log("ANA", x)
        fn.bind(null,x);
    })
    return (...more) => partial(fn, ...more)
  } else {
    return fn
  }
} 
