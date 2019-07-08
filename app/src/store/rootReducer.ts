import { combineReducers } from 'redux';
import { getType, StateType } from 'typesafe-actions';

import actions from './rootAction';

import items from '../components/Items/items.ducks';

const combinedReducers = combineReducers({
  items,
});

// TODO: Expose helper for these reducers?
const rootReducer: typeof combinedReducers = (state, action) => {
  switch (action.type) {
    case getType(actions.reset):
      return combinedReducers(undefined, action);

    case getType(actions.set):
      return combinedReducers(action.payload, action);

    default:
      return combinedReducers(state, action);
  }
};

export type RootState = StateType<typeof rootReducer>;
export default rootReducer;