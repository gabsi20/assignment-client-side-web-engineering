export function dispatchInTheMiddleOfReducer(state = [], action) {
  switch (action.type) {
    case DISPATCH_IN_MIDDLE:
      action.boundDispatchFn();
      return state;
    default:
      return state;
  }
}

export function getStateInTheMiddleOfReducer(state = [], action) {
  switch (action.type) {
    case GET_STATE_IN_MIDDLE:
      action.boundGetStateFn();
      return state;
    default:
      return state;
  }
}

export function subscribeInTheMiddleOfReducer(state = [], action) {
  switch (action.type) {
    case SUBSCRIBE_IN_MIDDLE:
      action.boundSubscribeFn();
      return state;
    default:
      return state;
  }
}

export function unsubscribeInTheMiddleOfReducer(state = [], action) {
  switch (action.type) {
    case UNSUBSCRIBE_IN_MIDDLE:
      action.boundUnsubscribeFn();
      return state;
    default:
      return state;
  }
}

export function errorThrowingReducer(state = [], action) {
  switch (action.type) {
    case THROW_ERROR:
      throw new Error();
    default:
      return state;
  }
}

export function hello(state, action) {
  const { type } = action;
  switch (type) {
    case "HELLO_WORLD":
      return { ...state, title: "Hello, World!" };
    default:
      return state;
  }
}

export function noop(state) {
  return state;
}

export function todos(state, action) {
  const { type, ...props } = action;
  switch (type) {
    case "ADD_TODO":
      return {
        todos: [...state.todos, action.todo]
      };
    default:
      return state;
  }
}
