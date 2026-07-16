import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";
import { NotificationProvider } from "./NotificationProvider";

export function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
}
