import { configureStore, createSelector } from '@reduxjs/toolkit';
import { worldSlice } from './features/world';

export const store = configureStore({
  reducer: {
    world: worldSlice.reducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export const selectCityById = (state: RootState, cityKey: number) => state.world.cities.byID[cityKey];