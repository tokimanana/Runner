import { User } from '../models/auth.model';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};
