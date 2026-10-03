import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/token";
import { type ReactNode } from "react";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (user?.role !== "ADMIN") {
    // Normal users attempting to access /admin routes are redirected to normal user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
