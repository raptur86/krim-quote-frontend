import { createContext, useContext } from "react";
import type { Admin, LoginRequest } from "./types/auth.types";
type Auth = {
  admin: Admin | null; loading: boolean; sessionError: string;
  login: (request: LoginRequest) => Promise<void>; logout: () => Promise<void>;
};
export const AuthContext = createContext<Auth | null>(null);
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider가 필요합니다.");
  return auth;
}
