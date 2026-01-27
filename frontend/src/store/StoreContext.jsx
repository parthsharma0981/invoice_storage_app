import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

// ---------- BACKEND API CONFIG ----------
const API_URL = "http://localhost:5000/api";

// Axios instance
const API = axios.create({ baseURL: API_URL });

// ✅ Attach token in every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("inv_token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ---------- HELPERS ----------
const loadLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// ---------- CONTEXT ----------
const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

// ---------- PROVIDER ----------
export function StoreProvider({ children }) {
  // --- AUTH STATE ---
  const [auth, setAuth] = useState(() => {
    const savedAuth = loadLS("inv_auth", null);
    const token = localStorage.getItem("inv_token");

    if (savedAuth && token) {
      return { ...savedAuth, token, isLoggedIn: true };
    }

    return { isLoggedIn: false, username: "", role: "", token: "" };
  });

  // --- DATA STATES ---
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dues, setDues] = useState([]);

  const defaultCompany = {
    name: "SHARMA ELECTRONICS & REFRIGERATION",
    address: "Shop No. 332/13, Idgah Road, Shahbad (M.), Distt. Kurukshetra",
    phone1: "94161-45940",
    phone2: "94163-27373",
    email: "ramansharma1303@gmail.com",
    gstin: "06EPSPK3391P1ZX",
    bankAccNo: "",
    ifscCode: "",
  };

  const [company, setCompany] = useState(defaultCompany);

  // ✅ Refresh all data (works after reload too)
  const refreshAllData = async () => {
    const token = localStorage.getItem("inv_token");
    if (!token) return;

    try {
      const reqs = [
        API.get("/products"),
        API.get("/customers"),
        API.get("/invoices"),
        API.get("/company"),
        API.get("/dues"),
      ];

      const [pRes, cRes, iRes, compRes, dueRes] = await Promise.all(reqs);

      setProducts(pRes.data || []);
      setCustomers(cRes.data || []);
      setInvoices(iRes.data || []);
      setDues(dueRes.data || []);

      if (compRes.data) setCompany(compRes.data);

      // ✅ Users only for Admin
      if (auth?.role === "admin") {
        try {
          const uRes = await API.get("/auth/users");
          setUsers(uRes.data || []);
        } catch (e) {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error loading data from MongoDB:", err?.response?.data || err.message);
    }
  };

  // ✅ Auto refresh when token exists (reload safe)
  useEffect(() => {
    if (auth?.token) {
      refreshAllData();
    }
    // eslint-disable-next-line
  }, [auth?.token]);

  // ✅ Save auth to localStorage
  useEffect(() => {
    if (auth?.isLoggedIn && auth?.token) {
      localStorage.setItem(
        "inv_auth",
        JSON.stringify({
          username: auth.username,
          role: auth.role,
        })
      );
      localStorage.setItem("inv_token", auth.token);
    }
  }, [auth]);

  // ---------- AUTH FUNCTIONS ----------
  const login = async (username, password) => {
    try {
      const res = await API.post("/auth/login", { username, password });

      const newAuth = {
        isLoggedIn: true,
        username: res.data.user.username,
        role: res.data.user.role,
        token: res.data.token,
      };

      // ✅ Save immediately
      localStorage.setItem("inv_token", res.data.token);
      localStorage.setItem(
        "inv_auth",
        JSON.stringify({
          username: newAuth.username,
          role: newAuth.role,
        })
      );

      // ✅ Update state
      setAuth(newAuth);

      // ✅ login ke turant baad data reload
      setTimeout(() => {
        refreshAllData();
      }, 0);

      return { ok: true, user: res.data.user, token: res.data.token };
    } catch (err) {
      return {
        ok: false,
        msg: err.response?.data?.msg || "Invalid Credentials",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("inv_token");
    localStorage.removeItem("inv_auth");

    setAuth({ isLoggedIn: false, username: "", role: "", token: "" });

    // ✅ Clear old data
    setUsers([]);
    setProducts([]);
    setCustomers([]);
    setInvoices([]);
    setDues([]);
    setCompany(defaultCompany);
  };

  // ---------- USERS ----------
  const addUser = async ({ username, password, role }) => {
    try {
      const res = await API.post("/auth/add-user", { username, password, role });
      setUsers((prev) => [res.data.user, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "User creation failed" };
    }
  };

  const deleteUser = async (id) => {
    try {
      await API.delete(`/auth/user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      return { ok: true };
    } catch (err) {
      console.error(err);
      return { ok: false };
    }
  };

  // ---------- PRODUCTS ----------
  const addProduct = async (p) => {
    try {
      const res = await API.post("/products", p);
      setProducts((prev) => [res.data, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to add product" };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to delete product" };
    }
  };

  const updateStock = async (id, newStock) => {
    try {
      await API.put(`/products/${id}`, { stock: Number(newStock) });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: Number(newStock) } : p))
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Stock update failed" };
    }
  };

  // ---------- CUSTOMERS ----------
  const addCustomer = async (c) => {
    try {
      const res = await API.post("/customers", c);
      setCustomers((prev) => [res.data, ...prev]);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to add customer" };
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to delete customer" };
    }
  };

  // ---------- DUES ----------
  const addDue = async (dueData) => {
    try {
      await API.post("/dues", dueData);

      // ✅ Always reload dues fresh
      const dueRes = await API.get("/dues");
      setDues(dueRes.data || []);

      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to save due" };
    }
  };

  const deleteDue = async (id) => {
    try {
      await API.delete(`/dues/${id}`);
      setDues((prev) => prev.filter((d) => d._id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to delete due" };
    }
  };

  // ---------- INVOICES ----------
  const createInvoice = async (payload) => {
    const { customerId, items, discount = 0, gstPercent = 0 } = payload;

    if (!customerId) return { ok: false, msg: "Customer required" };
    if (!items || items.length === 0) return { ok: false, msg: "Add items first" };

    const selectedCustomer = customers.find((c) => c._id === customerId);
    if (!selectedCustomer) return { ok: false, msg: "Customer not found" };

    const subtotal = items.reduce((sum, it) => sum + Number(it.qty) * Number(it.price), 0);

    const gstAmount = (subtotal * Number(gstPercent)) / 100;
    const grandTotal = Math.round(subtotal + gstAmount - Number(discount));

    const invoiceData = {
      ...payload,
      customerName: selectedCustomer.name,
      subtotal,
      gstPercent: Number(gstPercent),
      gstAmount: Math.round(gstAmount),
      grandTotal,
      companySnapshot: company,
      invoiceNo: "SER/25-26/" + (invoices.length + 1),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await API.post("/invoices", invoiceData);

      setInvoices((prev) => [res.data.invoice, ...prev]);

      // update stock locally
      setProducts((prev) =>
        prev.map((p) => {
          const item = items.find((x) => x.productId === p._id);
          return item ? { ...p, stock: p.stock - Number(item.qty) } : p;
        })
      );

      return { ok: true, invoice: res.data.invoice };
    } catch (err) {
      return { ok: false, msg: "Invoice Save Error" };
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await API.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to delete invoice" };
    }
  };

  // ---------- COMPANY ----------
  const updateCompany = async (updatedData) => {
    try {
      const res = await API.post("/company", updatedData);
      setCompany(res.data);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: "Failed to update company" };
    }
  };

  // ---------- PROVIDER VALUE ----------
  const value = useMemo(
    () => ({
      auth,
      login,
      logout,

      users,
      addUser,
      deleteUser,

      company,
      updateCompany,

      products,
      addProduct,
      deleteProduct,
      updateStock,

      customers,
      addCustomer,
      deleteCustomer,

      invoices,
      createInvoice,
      deleteInvoice,

      dues,
      addDue,
      deleteDue,

      refreshAllData,
    }),
    [auth, users, company, products, customers, invoices, dues]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
