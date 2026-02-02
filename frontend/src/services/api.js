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

// ---------- AUTH APIs ----------
export const loginAPI = (credentials) => API.post("/auth/login", credentials);
export const fetchUsersAPI = () => API.get("/auth/users");
export const addUserAPI = (userData) => API.post("/auth/add-user", userData);
export const deleteUserAPI = (id) => API.delete(`/auth/user/${id}`);

// ---------- PRODUCT APIs ----------
export const fetchProductsAPI = () => API.get("/products");
export const addProductAPI = (productData) => API.post("/products", productData);
export const updateStockAPI = (id, stock) => API.put(`/products/${id}`, { stock });
export const deleteProductAPI = (id) => API.delete(`/products/${id}`);

// ---------- CUSTOMER APIs ----------
export const fetchCustomersAPI = () => API.get("/customers");
export const addCustomerAPI = (customerData) => API.post("/customers", customerData);
export const deleteCustomerAPI = (id) => API.delete(`/customers/${id}`);

// ---------- INVOICE APIs ----------
export const fetchInvoicesAPI = () => API.get("/invoices");
export const createInvoiceAPI = (invoiceData) => API.post("/invoices", invoiceData);
export const deleteInvoiceAPI = (id) => API.delete(`/invoices/${id}`);

// ---------- DUE APIs ----------
export const fetchDuesAPI = () => API.get("/dues");
export const addDueAPI = (dueData) => API.post("/dues", dueData);
export const deleteDueAPI = (id) => API.delete(`/dues/${id}`);
export const sendReminderAPI = (id) => API.post(`/dues/${id}/remind`);

// ---------- COMPANY APIs ----------
export const fetchCompanyAPI = () => API.get("/company");
export const updateCompanyAPI = (companyData) => API.post("/company", companyData);

// ---------- INSIGHTS APIs (BASIC) ----------
export const fetchReorderAPI = () => API.get("/insights/reorder");
export const fetchBestSellingAPI = (days = 30) => API.get(`/insights/best-selling?days=${days}`);
export const fetchLowDemandAPI = (days = 30) => API.get(`/insights/low-demand?days=${days}`);
export const fetchMonthlyReportAPI = () => API.get("/insights/monthly-report");

// ---------- INSIGHTS APIs (ADVANCED) ----------
export const fetchProfitAnalysisAPI = (days = 30) => API.get(`/insights-advanced/profit?days=${days}`);
export const fetchTopCustomersAPI = (days = 30) => API.get(`/insights-advanced/top-customers?days=${days}`);
export const fetchBestSellingRangeAPI = (range = "month", limit = 10) =>
    API.get(`/insights-advanced/best-selling-range?range=${range}&limit=${limit}`);
export const fetchDeadStockAPI = (days = 90) => API.get(`/insights-advanced/dead-stock?days=${days}`);
export const fetchSmartReorderAPI = (days = 30) => API.get(`/insights-advanced/smart-reorder?days=${days}`);

export default API;
