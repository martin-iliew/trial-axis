export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: "Customer" | "Admin";
  createdAt: string;
}
