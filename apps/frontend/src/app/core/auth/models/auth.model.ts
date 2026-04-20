export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tourOperatorId: string;
}

export interface LoginResponse {
  user: User;
}

export function isLoginResponse(data: unknown): data is LoginResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'user' in data &&
    typeof (data as LoginResponse).user?.id === 'string' &&
    typeof (data as LoginResponse).user?.email === 'string' &&
    typeof (data as LoginResponse).user?.firstName === 'string' &&
    typeof (data as LoginResponse).user?.lastName === 'string' &&
    typeof (data as LoginResponse).user?.role === 'string' &&
    typeof (data as LoginResponse).user?.tourOperatorId === 'string'
  );
}
