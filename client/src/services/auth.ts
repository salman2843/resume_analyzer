import api from "./api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
};

export async function login(input: LoginInput) {
  const response = await api.post<AuthResponse>("/auth/login", input);
  return response.data;
}

export async function register(input: RegisterInput) {
  const response = await api.post<AuthResponse>("/auth/register", input);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<{ user: User }>("/auth/me");
  return response.data.user;
}
