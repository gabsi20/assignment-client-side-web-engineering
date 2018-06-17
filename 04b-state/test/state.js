import { createStore } from "../src/store";
import {
  dispatchInTheMiddleOfReducer,
  getStateInTheMiddleOfReducer,
  subscribeInTheMiddleOfReducer,
  unsubscribeInTheMiddleOfReducer,
  errorThrowingReducer,
  hello,
  noop,
  todos
} from "./helpers/reducers";
import { combineReducers } from "../src/combine-reducers";

function unknownAction() {
  return { type: "UNKNOWN_ACTION" };
}

const mock = {
  fn() {
    const mock = {
      calls: []
    };
    const f = function(...args) {
      mock.calls.push({ args });
    };
    f.mock = mock;
    return f;
  }
};

describe("04-state", () => {
  describe("store", () => {
    it("should create a store", () => {
      const store = createStore(hello);
      const methods = Object.keys(store);

      methods.should.containDeep(["dispatch", "subscribe", "getState"]);
      methods.forEach(m => store[m].should.be.a.Function());
    });

    it("should throw if reducer is not a function", () => {
      should.throws(() => createStore());
      should.throws(() => createStore("hello"));
      should.throws(() => createStore({}));
      should.doesNotThrow(() => createStore(() => {}));
    });

    it("passes the initial state", () => {
      const store = createStore(noop, { a: 1, b: { c: 2 } });
      store.getState().should.be.deepEqual({ a: 1, b: { c: 2 } });
    });

    it("applies the reducer to the previous state", () => {
      const store = createStore(todos, { todos: [] });
      store.getState().should.be.deepEqual({ todos: [] });

      store.dispatch(unknownAction());
      store.getState().should.be.deepEqual({ todos: [] });

      store.dispatch({ type: "ADD_TODO", todo: { id: 1, text: "First" } });
      store
        .getState()
        .should.be.deepEqual({ todos: [{ id: 1, text: "First" }] });

      store.dispatch({ type: "ADD_TODO", todo: { id: 2, text: "Second" } });
      store.getState().should.be.deepEqual({
        todos: [{ id: 1, text: "First" }, { id: 2, text: "Second" }]
      });
    });

    it("applies the reducer to the initial state", () => {
      const store = createStore(todos, { todos: [{ id: 1, text: "First" }] });
      store
        .getState()
        .should.be.deepEqual({ todos: [{ id: 1, text: "First" }] });

      store.dispatch(unknownAction());
      store
        .getState()
        .should.be.deepEqual({ todos: [{ id: 1, text: "First" }] });

      store.dispatch({ type: "ADD_TODO", todo: { id: 2, text: "Second" } });
      store.getState().should.be.deepEqual({
        todos: [{ id: 1, text: "First" }, { id: 2, text: "Second" }]
      });
    });
  });

  describe("listeners", () => {
    it("supports multiple subscriptions", () => {
      const store = createStore(todos);
      const listenerA = mock.fn();
      const listenerB = mock.fn();

      let unsubscribeA = store.subscribe(listenerA);
      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(1);
      listenerB.mock.calls.should.have.length(0);

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(2);
      listenerB.mock.calls.should.have.length(0);

      const unsubscribeB = store.subscribe(listenerB);
      listenerA.mock.calls.should.have.length(2);
      listenerB.mock.calls.should.have.length(0);

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(1);

      unsubscribeA();
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(1);

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(2);

      unsubscribeB();
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(2);

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(2);

      unsubscribeA = store.subscribe(listenerA);
      listenerA.mock.calls.should.have.length(3);
      listenerB.mock.calls.should.have.length(2);

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(4);
      listenerB.mock.calls.should.have.length(2);
    });

    it("only removes listener once when unsubscribe is called", () => {
      const store = createStore(todos);
      const listenerA = mock.fn();
      const listenerB = mock.fn();

      const unsubscribeA = store.subscribe(listenerA);
      store.subscribe(listenerB);

      unsubscribeA();
      unsubscribeA();

      store.dispatch(unknownAction());
      listenerA.mock.calls.should.have.length(0);
      listenerB.mock.calls.should.have.length(1);
    });

    it("only removes relevant listener when unsubscribe is called", () => {
      const store = createStore(todos);
      const listener = mock.fn();

      store.subscribe(listener);
      const unsubscribeSecond = store.subscribe(listener);

      unsubscribeSecond();
      unsubscribeSecond();

      store.dispatch(unknownAction());
      listener.mock.calls.should.have.length(1);
    });

    it("notifies all subscribers about current dispatch regardless if any of them gets unsubscribed in the process", () => {
      const store = createStore(todos);

      const unsubscribeHandles = [];
      const doUnsubscribeAll = () =>
        unsubscribeHandles.forEach(unsubscribe => unsubscribe());

      const listener1 = mock.fn();
      const listener2 = mock.fn();
      const listener3 = mock.fn();

      unsubscribeHandles.push(store.subscribe(() => listener1()));
      unsubscribeHandles.push(
        store.subscribe(() => {
          listener2();
          doUnsubscribeAll();
        })
      );
      unsubscribeHandles.push(store.subscribe(() => listener3()));

      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(1);
      listener2.mock.calls.should.have.length(1);
      listener3.mock.calls.should.have.length(1);

      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(1);
      listener2.mock.calls.should.have.length(1);
      listener3.mock.calls.should.have.length(1);
    });

    it("notifies only subscribers active at the moment of current dispatch", () => {
      const store = createStore(todos);

      const listener1 = mock.fn();
      const listener2 = mock.fn();
      const listener3 = mock.fn();

      let listener3Added = false;
      const maybeAddThirdListener = () => {
        if (!listener3Added) {
          listener3Added = true;
          store.subscribe(() => listener3());
        }
      };

      store.subscribe(() => listener1());
      store.subscribe(() => {
        listener2();
        maybeAddThirdListener();
      });

      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(1);
      listener2.mock.calls.should.have.length(1);
      listener3.mock.calls.should.have.length(0);

      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(2);
      listener2.mock.calls.should.have.length(2);
      listener3.mock.calls.should.have.length(1);
    });

    it("uses the last snapshot of subscribers during nested dispatch", () => {
      const store = createStore(todos);

      const listener1 = mock.fn();
      const listener2 = mock.fn();
      const listener3 = mock.fn();
      const listener4 = mock.fn();

      let unsubscribe4;
      const unsubscribe1 = store.subscribe(() => {
        listener1();
        listener1.mock.calls.should.have.length(1);
        listener2.mock.calls.should.have.length(0);
        listener3.mock.calls.should.have.length(0);
        listener4.mock.calls.should.have.length(0);

        unsubscribe1();
        unsubscribe4 = store.subscribe(listener4);
        store.dispatch(unknownAction());

        listener1.mock.calls.should.have.length(1);
        listener2.mock.calls.should.have.length(1);
        listener3.mock.calls.should.have.length(1);
        listener4.mock.calls.should.have.length(1);
      });
      store.subscribe(listener2);
      store.subscribe(listener3);

      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(1);
      listener2.mock.calls.should.have.length(2);
      listener3.mock.calls.should.have.length(2);
      listener4.mock.calls.should.have.length(1);

      unsubscribe4();
      store.dispatch(unknownAction());
      listener1.mock.calls.should.have.length(1);
      listener2.mock.calls.should.have.length(3);
      listener3.mock.calls.should.have.length(3);
      listener4.mock.calls.should.have.length(1);
    });

    it("provides an up-to-date state when a subscriber is notified", done => {
      const store = createStore(todos, { todos: [] });
      store.subscribe(() => {
        store.getState().todos.should.be.deepEqual([
          {
            id: 1,
            text: "Hello"
          }
        ]);
        done();
      });
      store.dispatch({ type: "ADD_TODO", todo: { id: 1, text: "Hello" } });
    });

    it("does not leak private listeners array", done => {
      const store = createStore(todos, { todos: [] });
      store.subscribe(function() {
        should(this).be.undefined();
        done();
      });
      store.dispatch({ type: "ADD_TODO", todo: { id: 1, text: "Hello" } });
    });
  });

  describe("actions", () => {
    it("only accepts plain object actions", () => {
      const store = createStore(todos);
      should.doesNotThrow(() => store.dispatch(unknownAction()));

      function AwesomeMap() {}
      [null, undefined, 42, "hey", new AwesomeMap()].forEach(nonObject =>
        should.throws(() => store.dispatch(nonObject))
      );
    });
  });

  describe("dispatch", () => {
    it("handles nested dispatches gracefully", () => {
      function foo(state = 0, action) {
        return action.type === "foo" ? 1 : state;
      }

      function bar(state = 0, action) {
        return action.type === "bar" ? 2 : state;
      }

      const store = createStore(combineReducers({ foo, bar }));

      store.subscribe(function kindaComponentDidUpdate() {
        const state = store.getState();
        if (state.bar === 0) {
          store.dispatch({ type: "bar" });
        }
      });

      store.dispatch({ type: "foo" });
      store.getState().should.be.deepEqual({
        foo: 1,
        bar: 2
      });
    });
  });

  describe("forbidden", () => {
    it("does not allow dispatch() from within a reducer", () => {
      const store = createStore(dispatchInTheMiddleOfReducer);

      should.throws(() =>
        store.dispatch(
          dispatchInMiddle(store.dispatch.bind(store, unknownAction()))
        )
      );
    });

    it("does not allow getState() from within a reducer", () => {
      const store = createStore(getStateInTheMiddleOfReducer);

      should.throws(() =>
        store.dispatch(getStateInMiddle(store.getState.bind(store)))
      );
    });

    it("does not allow subscribe() from within a reducer", () => {
      const store = createStore(subscribeInTheMiddleOfReducer);

      should.throws(() =>
        store.dispatch(subscribeInMiddle(store.subscribe.bind(store, () => {})))
      );
    });

    it("does not allow unsubscribe from subscribe() from within a reducer", () => {
      const store = createStore(unsubscribeInTheMiddleOfReducer);
      const unsubscribe = store.subscribe(() => {});

      should.throws(() =>
        store.dispatch(unsubscribeInMiddle(unsubscribe.bind(store)))
      );
    });
  });
  describe("errors", () => {
    it("recovers from an error within a reducer", () => {
      const store = createStore(errorThrowingReducer);
      should.throws(() => store.dispatch(throwError()));

      should.throws(() => store.dispatch(unknownAction()));
    });

    it("throws if action type is missing", () => {
      const store = createStore(todos);
      should.throws(() => store.dispatch({}));
    });

    it("throws if action type is undefined", () => {
      const store = createStore(todos);
      should.throws(() => store.dispatch({ type: undefined }));
    });

    it("does not throw if action type is falsy", () => {
      const store = createStore(todos);
      should.doesNotThrow(() => store.dispatch({ type: false }));
      should.doesNotThrow(() => store.dispatch({ type: 0 }));
      should.doesNotThrow(() => store.dispatch({ type: null }));
      should.doesNotThrow(() => store.dispatch({ type: "" }));
    });
  });
});
