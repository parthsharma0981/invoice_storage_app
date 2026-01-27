import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Landing from "./Landing";
import Login from "./Login";
import Register from "./Register";
import Payment from "./Payment";

import Layout from "../components/Layout";

import Dashboard from "./Dashboard";
import Products from "./Products";
import Customers from "./Customers";
import CreateInvoice from "./CreateInvoice";
import Invoices from "./Invoices";
import CompanySettings from "./CompanySettings";
import InvoicePrint from "./InvoicePrint";
import Users from "./Users";
import ManageDues from "./ManageDues";

// ✅ ADD THIS IMPORT
import Insights from "./Insights";

import { useStore } from "../store/StoreContext";
import RequireRole from "../components/RequireRole";

// ✅ Private Route (Login check)
function PrivateRoute({ children }) {
  const { auth } = useStore();
  return auth?.isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function RoutesApp() {
  const { auth } = useStore(); // ✅ ADD THIS

  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ New Public Routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/payment" element={<Payment />} />

      {/* ✅ Protected Routes */}
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* ✅ FIXED: Default Route (Admin => Dashboard, Staff => Customers) */}
        <Route
          index
          element={
            auth?.role === "admin" ? (
              <Dashboard />
            ) : (
              <Navigate to="/app/customers" replace />
            )
          }
        />

        {/* Admin Only Users */}
        <Route
          path="users"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <Users />
            </RequireRole>
          }
        />

        {/* Admin Only Pages */}
        <Route
          path="products"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <Products />
            </RequireRole>
          }
        />

        {/* ✅ ADD THIS ROUTE (Insights - Admin Only) */}
        <Route
          path="insights"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <Insights />
            </RequireRole>
          }
        />

        <Route
          path="company"
          element={
            <RequireRole allowedRoles={["admin"]}>
              <CompanySettings />
            </RequireRole>
          }
        />

        {/* Staff + Admin Pages */}
        <Route
          path="customers"
          element={
            <RequireRole allowedRoles={["admin", "staff"]}>
              <Customers />
            </RequireRole>
          }
        />

        <Route
          path="manage-dues"
          element={
            <RequireRole allowedRoles={["admin", "staff"]}>
              <ManageDues />
            </RequireRole>
          }
        />

        <Route
          path="create-invoice"
          element={
            <RequireRole allowedRoles={["admin", "staff"]}>
              <CreateInvoice />
            </RequireRole>
          }
        />

        <Route
          path="invoices"
          element={
            <RequireRole allowedRoles={["admin", "staff"]}>
              <Invoices />
            </RequireRole>
          }
        />

        {/* Print Invoice */}
        <Route
          path="invoice/:id/print"
          element={
            <RequireRole allowedRoles={["admin", "staff"]}>
              <InvoicePrint />
            </RequireRole>
          }
        />
      </Route>

      {/* ✅ Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
