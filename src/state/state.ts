import { combineReducers, configureStore, createSelector, getDefaultMiddleware, Middleware } from '@reduxjs/toolkit';
import { GameStorageInstance } from '../GameStorage';
import { ISelectedSlice, selectedSlice } from './features/selected.reducer';
import { IWorldState } from './features/world';
import { selectBeans, worldSlice } from './features/world.reducer';

// export type RootState = ReturnType<typeof store.getState>;
export type RootState = {
  world: IWorldState,
  selected: ISelectedSlice
};
export const autosaveSignalMiddleware: Middleware<
  {}, // Most middleware do not modify the dispatch return value
  RootState
> = storeApi => next => action => {
  
  switch (action.type){
    case 'world/magnetChange':
      break;
    default:
      if (!action.type.startsWith('selected')){
        GameStorageInstance.Dirty.publish(true);
      }
  }
  
  return next(action)
}
export const store = configureStore({
  reducer: {
    world: worldSlice.reducer,
    selected: selectedSlice.reducer
  },
  middleware: getDefaultMiddleware().concat([autosaveSignalMiddleware])
})

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const selectBeanById = (state: RootState, beanKey: number) => state.world.beans.byID[beanKey];
export const selectCityById = (state: RootState, cityKey: number) => state.world.cities.byID[cityKey];
export const selectSelectedCity = (state: RootState) => {
  return state.selected.selectedCityKey != null ? state.world.cities.byID[state.selected.selectedCityKey] : undefined;
}
export const selectSelectedBean = (state: RootState) => {
  return state.selected.selectedBeanKey != null ? state.world.beans.byID[state.selected.selectedBeanKey] : undefined;
}
export const selectSelectedBuilding = (state: RootState) => {
  const city = state.selected.selectedCityKey != null && state.world.cities.byID[state.selected.selectedCityKey];
  if (city && state.selected.selectedLotKey != null)
  {
    const buildingID = state.world.lots.byID[state.selected.selectedLotKey].buildingKey;
    if (buildingID != null)
      return state.world.buildings.byID[buildingID];
  }
  return undefined;
}
export const selectEventIDs = (state: RootState) => {
  return state.world.events.allIDs.map(y => state.world.events.byID[y]);
};