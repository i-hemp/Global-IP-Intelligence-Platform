import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AnalystSidebar from "../../components/AnalystSidebar";

export default function AnalystLayout() {

  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!token || role !== "ANALYST") {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ===== TOPBAR (FULL WIDTH) ===== */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 z-50">

        <div>
          <h1 className="text-lg font-bold text-indigo-400">
            Global IP Intelligence Platform
          </h1>
          <p className="text-xs text-gray-400">
            Analyst Control Center
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium">Analyst</p>
            <p className="text-xs text-gray-400">Secure Access</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

      </div>

      {/* ===== MAIN SECTION ===== */}
      <div className="flex pt-16">

        {/* SIDEBAR */}
        <AnalystSidebar />

        {/* PAGE CONTENT */}
        <div className="flex-1 ml-64 p-10">
          <Outlet />
        </div>

      </div>

    </div>
  );
}