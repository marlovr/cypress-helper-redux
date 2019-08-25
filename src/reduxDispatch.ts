import redux from './redux';
import { Action, ActionsCreators } from './common';

type ReduxDispatchCallback = (
  actionCreators: ActionsCreators
) => Action | Action[];

// TODO: Add option to turn off logging, like for `get`
export default (callback: ReduxDispatchCallback): void => {
  redux(({ dispatch }, actionCreators) => {
    const actions = callback(actionCreators);
    for (const action of Array.isArray(actions) ? actions : [actions]) {
      dispatch(action);
      Cypress.log({
        name: 'reduxDispatch',
        displayName: 'Dispatch',
        message: [action.type],
        consoleProps: () => ({
          type: action.type,
          payload: 'payload' in action ? action.payload : undefined,
          action,
        }),
      });
    }
  });
};
