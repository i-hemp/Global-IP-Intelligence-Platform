import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { initializeAdmin } from "./utils/auth";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import DetailPage from "./Pages/DetailPage";
import Profile from "./Pages/Profile";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";

/* 🔥 NEW ANALYST STRUCTURE */
import AnalystLayout from "./Pages/Analyst/AnalystLayout";
import AnalystDashboardPage from "./Pages/Analyst/AnalystDashboardPage";
import AnalystSearchPage from "./Pages/Analyst/AnalystSearchPage";
import AnalystVisualizationPage from "./Pages/Analyst/AnalystVisualizationPage";
import AnalystExportPage from "./Pages/Analyst/AnalystExportPage";

export default function App() {
  useEffect(() => {
    initializeAdmin();
  }, []);

  return (
    <>
      {/* Global Theme Toggle */}
     

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/assets/:id" element={<DetailPage />} />

        {/* 🔥 ANALYST NESTED ROUTES */}
        <Route path="/analyst" element={<AnalystLayout />}>
          <Route index element={<AnalystDashboardPage />} />
          <Route path="dashboard" element={<AnalystDashboardPage />} />
          <Route path="search" element={<AnalystSearchPage />} />
          <Route path="visualization" element={<AnalystVisualizationPage />} />
          <Route path="export" element={<AnalystExportPage />} />
          <Route path="assets/:id" element={<DetailPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>

      {/* Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        newestOnTop
        pauseOnHover
      />
    </>
  );
}
