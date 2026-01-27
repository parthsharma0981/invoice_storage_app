import React from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function RequireRole({ allowedRoles, children }) {
  const { auth } = useStore();

  // Not logged in
  if (!auth?.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Not allowed role -> send inside app home for staff/admin
  if (!allowedRoles.includes(auth.role)) {
    // ✅ Staff safe redirect
    if (auth.role === "staff") {
      return <Navigate to="/app/customers" replace />;
    }

    // ✅ Admin safe redirect
    return <Navigate to="/app" replace />;
  }

  return children;
}
