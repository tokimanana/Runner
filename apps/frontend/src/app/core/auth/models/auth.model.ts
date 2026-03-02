export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tourOperatorId: string;
}

export interface LoginRsponse {
  access_token: string;
  user: User;
}
