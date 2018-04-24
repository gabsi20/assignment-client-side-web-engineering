/*
 * Implement a currify function. The function should return a currified
 * variation of the given function.
 *
 * - Works with an arbitrary length of arguments
 * - Works with ...rest if curry is invoked with a second argument "length"
 * - `curry` is a pure function!
 * - Has auto currying after initial call
 */
export function curry(fn, length = fn.length, ...args) {
  return (length === args.length)
      ? (args.length === 0) ? fn : fn(...args)
      : (...more) => curry(fn, length, ...args, ...more);
}


