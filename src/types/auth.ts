export interface User {
  name: string;
  role: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  logout: () => void;
  login: (user: User) => void;
}