import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layout/MainLayout.jsx";
import ProtectedRoutes from "../components/ProtectedRoutes.jsx";
import Loading from "../components/Loading.jsx";


const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const Dashboard = lazy(() => import("../pages/Dashbord.jsx"));
const Clients = lazy(() => import("../pages/Clients.jsx"));
const ClientForm = lazy(() => import("../pages/ClientForm.jsx"));
const Invoices = lazy(() => import("../pages/Invoices.jsx"));
const InvoiceDetails = lazy(() => import("../pages/InvoiceDetails.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));
const InvoiceForm = lazy(() => import("../pages/InvoiceForm.jsx"));
function AppRoutes() {
  return (
    <Suspense fallback={<Loading/>}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id/edit" element={<ClientForm />} />

            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetails />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;