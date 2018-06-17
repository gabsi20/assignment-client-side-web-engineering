import { isPlainObject } from "./utils/is-plain-object";

/**
 * Implement a predictable state container (inspired by Redux):
 *
 * 1. The should be created by a `createStore` factory (use Crockford's Object creation pattern: https://www.youtube.com/watch?v=PSGEjv3Tqo0)
 * 2. The store object returned should provide `dispatch`, `subscribe` and `getState` methods
 * 3. Reducers must always be functions!
 * 4. Actions must always be plain objects!
 * 5. A store can have more than one subscriber
 * 6. Ensures immutability of listeners is guaranteed during a dispatch cycle
 * 7. Allows nested dispatch
 * 8. Does not leak listeners
 * 9. Does not allow dispatch(), getState(), subscribe(), unsubscribe() from within a reducer
 * 13. Recovers from errors
 * 14. Throws if action type is missin or undefined and not if falsy
 */
export function createStore(reducer, state) {}
