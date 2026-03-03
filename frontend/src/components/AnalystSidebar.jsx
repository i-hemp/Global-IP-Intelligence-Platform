import { NavLink } from "react-router-dom";

export default function AnalystSidebar() {
  return (
    <div className="fixed w-64 h-screen bg-slate-950 border-r border-slate-800 p-6">

      <h2 className="text-2xl font-extrabold tracking-wide mb-8">
        Analyst Panel
      </h2>

      <div className="space-y-6">

        <NavLink
          to="/analyst/dashboard"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold text-base"
              : "block text-gray-400 hover:text-indigo-400 text-base"
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/analyst/search"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold text-base"
              : "block text-gray-400 hover:text-indigo-400 text-base"
          }
        >
          Search
        </NavLink>

        <NavLink
          to="/analyst/visualization"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold text-base"
              : "block text-gray-400 hover:text-indigo-400 text-base"
          }
        >
          Visualization
        </NavLink>

        <NavLink
          to="/analyst/export"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold text-base"
              : "block text-gray-400 hover:text-indigo-400 text-base"
          }
        >
          Export
        </NavLink>

        {/* 🔥 NEW PROFILE LINK */}
        <NavLink
          to="/analyst/profile"
          className={({ isActive }) =>
            isActive
              ? "block text-indigo-400 font-semibold text-base"
              : "block text-gray-400 hover:text-indigo-400 text-base"
          }
        >
          Profile
        </NavLink>

      </div>
    </div>
  );
}