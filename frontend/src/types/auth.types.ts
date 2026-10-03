export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

export type User = {
  id?: string;
  _id?: string;
  name?: string | null;
  email: string;
  mobile?: string | null;
  address?: string | null;
  role?: "USER" | "ADMIN";
  status?: "ACTIVE" | "INACTIVE";
  energyLimit?: number;
  lastActive?: string;
  createdAt?: string;
};

export type AuthResponseData = {
  token: string;
  user: User;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
