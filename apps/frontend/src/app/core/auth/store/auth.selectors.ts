import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.user
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state) => state.user
);

export const selectUserRole = createSelector(
  selectAuthState,
  (state) => state.user?.role
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);
