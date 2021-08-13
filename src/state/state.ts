import { combineReducers, configureStore, createSelector } from '@reduxjs/toolkit';
import { selectedSlice } from './features/selected.reducer';
import { selectBeans, worldSlice } from './features/world.reducer';

export const store = configureStore({
  reducer: {
    world: worldSlice.reducer,
    selected: selectedSlice.reducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
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
  const city = state.selected.selectedCityKey != null && state.selected.selectedCityKey > 0 && state.world.cities.byID[state.selected.selectedCityKey];
  if (city && state.selected.selectedHexKey != null)
  {
    const buildingID = city.buildingMap[state.selected.selectedHexKey];
    return state.world.buildings.byID[buildingID];

  } else {
    return undefined;
  }
}
export const selectEventIDs = (state: RootState) => {
  return state.world.events.allIDs.map(y => state.world.events.byID[y]);
};