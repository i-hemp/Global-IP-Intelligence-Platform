import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

export default function AnalystDashboardPage() {

  const token = localStorage.getItem("accessToken");
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/ip-assets",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAssets(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= KPI CALCULATIONS ================= */

  const totalAssets = assets.length;
  const granted = assets.filter(a => a.status === "Granted").length;
  const filed = assets.filter(a => a.status === "Filed").length;
  const expired = assets.filter(a => a.status === "Expired").length;

  const grantRate =
    totalAssets > 0
      ? ((granted / totalAssets) * 100).toFixed(1)
      : 0;

  /* ================= STATUS DATA ================= */

  const statusData = useMemo(() => {
    const counts = {};
    assets.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [assets]);

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#22d3ee"];

  return (
    <div>

      <h2 className="text-3xl font-bold text-indigo-400 mb-8">
        Executive Dashboard
      </h2>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

        <KpiCard title="Total Assets" value={totalAssets} color="text-indigo-400" />
        <KpiCard title="Filed" value={filed} color="text-yellow-400" />
        <KpiCard title="Granted" value={granted} color="text-green-400" />
        <KpiCard title="Expired" value={expired} color="text-red-400" />
        <KpiCard title="Grant Rate (%)" value={grantRate} color="text-cyan-400" />

      </div>

      {/* ================= MAIN CHART + RECENT ACTIVITY ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* DONUT CHART */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-4">
            IP Lifecycle Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-indigo-400 font-semibold mb-4">
            Recent Filings
          </h3>

          <div className="space-y-4 max-h-72 overflow-y-auto">

            {assets.slice(0, 5).map(asset => (
              <div
                key={asset.id}
                className="bg-slate-900 p-4 rounded-lg border border-slate-700"
              >
                <p className="font-semibold text-white">
                  {asset.title}
                </p>
                <p className="text-sm text-gray-400">
                  {asset.assignee} • {asset.jurisdiction}
                </p>
                <p className="text-xs text-gray-500">
                  Status: {asset.status}
                </p>
              </div>
            ))}

            {assets.length === 0 && (
              <p className="text-gray-400">No recent activity</p>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}

/* ================= REUSABLE KPI CARD ================= */

function KpiCard({ title, value, color }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}