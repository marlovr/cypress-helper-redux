# cypress-helper-redux

[![npm version](https://img.shields.io/npm/v/cypress-helper-redux.svg?style=flat-square)](https://www.npmjs.com/package/cypress-helper-redux)

> [Cypress](https://www.cypress.io/) [commands](https://docs.cypress.io/api/cypress-api/custom-commands.html) for manipulating a [Redux](https://redux.js.org/) store during testing. For example to:
>
> - Set up a predictable state before certain tests
> - Dispatch actions to make state adjustmens during tests
> - Validate state during or after tests have run

## Inspiration

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices.html#Organizing-Tests-Logging-In-Controlling-State)
- [This presentation at YouTube](https://www.youtube.com/watch?v=5XQOK0v_YRE&t=1568)

## Setup

### 1. Install:

```shell
npm install --save-dev cypress-helper-redux
```

### 2. Include:

```ts
// cypress/support/index.ts
include 'cypress-helper-redux';
```

### 3. Connect:

```ts
// e.g. in src/store/index.ts

// Get initial state (from cy.reduxVisit)
const initialState =
  'Cypress' in window ? (window as any).__chr__initialState__ : undefined;

// Create the store, as you normally would
const store = createStore(rootReducer, initialState);

// Expose it so the helper knows where to find it
if ('Cypress' in window) (window as any).__chr__reduxStore__ = store;
```

## Usage

> **Note:** For a working example of setting up and using this helper, you can check out the [test app](app).
>
> It's also an example of setting up [`redux-devtools-extension`](https://www.npmjs.com/package/redux-devtools-extension), and of using [`typesafe-actions`](https://www.npmjs.com/package/typesafe-actions), [Redux Hooks](https://reactjs.org/docs/hooks-intro.html) and a variant of [Redux Ducks](https://github.com/erikras/ducks-modular-redux) for (imo) a pretty strongly typed Redux setup, without a lot of hassle.

### `cy.reduxVisit`

A wrapper around `cy.visit` allowing you to specify the initial Redux state you want for a test.

```ts
cy.reduxVisit('/', {
  initialState: { ... },
});
```

Any other options you supply will be passed through to `cy.visit`.

```ts
cy.reduxVisit('/', {
  initialState: { ... },
  method: 'GET',
  onBeforeLoad: (window) => console.log(window),
});
```

If you don't want/need to specify any initial state, you can of course also just use `cy.visit` as you normally would.

### `cy.redux`

Gives direct access to the Redux store to do with as you please.

```ts
cy.redux(store => {
  store.dispatch({
    type: 'set-value',
    payload: 'something',
  });

  const value = store.getState().foobar.value;
  expect(value).to.equal('something');
});
```

Using destructuring, action creators and selector functions can make your tests even cleaner:

```ts
cy.redux(({ getState, dispatch }) => {
  dispatch(setValue('something'));

  const value = getValue(getState());
  expect(value).to.equal('something');
});
```

### `cy.reduxSelect`

Wrapper around `cy.redux` for when you just want to select a value from the current state, for example to validate something after or during a test.

```ts
// Using a function
cy.reduxSelect(
  state => state.foobar,
  value => {
    expect(value).to.equal('something');
  }
);

// Using an already defined selector function
cy.reduxSelect(selectFoobar, value => {
  expect(value).to.equal('something');
});
```

### `cy.reduxDispatch`

Wrapper around `cy.redux` for when you just want to dispatch an action, for example to set something up before or during test.

```ts
// Using a plain object
cy.reduxDispatch(() => ({ type: 'my-action' }));

// Using an action creator
cy.reduxDispatch(() => myAction());
```

You can also return an `array` to easily dispatch multiple actions in order.

```ts
// Using plain objects
cy.reduxDispatch(() => [{ type: 'my-action' }, { type: 'my-other-action' }]);

// Using action creators
cy.reduxDispatch(() => [myAction(), myOtherAction()]);
```

## Usage with an Action Creators object

To create actions to dispatch you can (of course) both implement custom action creators in your tests and import action creators from application code. However, sometimes this can be tricky since Cypress will then (obviously) need access to your application source code _and_ know how to and compile/read it properly. With a combination of typescript, webpack, babel, bundlers, etc., etc., this can sometimes be easier said than done...

I want dispatching actions to be as simple and clean as possible, so my tests can be kept as simple and clean as possible, regardless of all that.

So, optionally, you can also expose an "action creators object" to the helper which will then be passed along to any `cy.redux` and `cy.reduxDispatch` callbacks.

### Setup

```ts
// e.g. in src/store/rootAction.ts

// Import all the action creators from your application
import { actions as foo } from '../components/Foo/foo.ducks';
import { actions as bar } from '../components/Bar/bar.ducks';

// Gather them all up into an object
const actionCreators = { foo, bar };

// Expose it so the helper knows where to find it
if ('Cypress' in window) {
  (window as any).__chr__actionCreators__ = actionCreators;
}
```

### Usage

```ts
cy.redux((store, actions) => {
  store.dispatch(actions.foo.someAction());
});

cy.reduxDispatch(actions => actions.foo.someAction());

cy.reduxDispatch(actions => [
  actions.bar.doOne(),
  actions.bar.doTwo(),
  actions.bar.doThree(),
]);

// Potentially even more compact using destructuring
cy.reduxDispatch(({ bar }) => [bar.doOne(), bar.doTwo(), bar.doThree()]);
```

# TODO

1. **Make it possible for `cy.reduxSelect` to get a "selector object" to `cy.reduxDispatch`**

2. **Strongly typed state and action creators**  
   The state and action creators are currently both typed as `any` (in the added helper methods), and I'd really like them not to be. But I'm not sure how to get those types from the application code "into" the added Cypress helper method chaining thing in a smooth way... ideas are welcome... 🤔

3. **Snapshot logging**  
   In Cypress there seems to be a way to do snapshot logging, which would be perfect to do before and after having dispatched any actions. However, I haven't yet been able to figure out exactly how one does that... please let me know if you have any pointers... 😕

4. **Helper functions to connect store and action creators to the helper**  
   Should be simple in theory, but for some reason, everything seems to crash (`cy is not defined` in Cypress) the instant I do any imports in the application code from the helper code... 😕  
   Might also be simple enough as it is... and it prevents any helper code ending up in the application bundle, so... maybe better the way it is...?
