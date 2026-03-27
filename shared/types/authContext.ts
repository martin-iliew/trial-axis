import type { User } from "../api-types/auth";
import type { UserRole, Permission } from "../constants/roles";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void | Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  canDo: (permission: Permission) => boolean;
}
