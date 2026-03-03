import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  Tooltip, Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function AnalystVisualizationPage() {

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

  /* ================= STATUS DISTRIBUTION ================= */

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

  /* ================= JURISDICTION DISTRIBUTION ================= */

  const jurisdictionData = useMemo(() => {
    const counts = {};
    assets.forEach(a => {
      counts[a.jurisdiction] = (counts[a.jurisdiction] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [assets]);

  /* ================= FILING TREND ================= */

  const trendData = useMemo(() => {
    const counts = {};

    assets.forEach(a => {
      if (!a.filingDate) return;

      const year = new Date(a.filingDate).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });

    return Object.keys(counts)
      .sort()
      .map(year => ({
        year,
        filings: counts[year]
      }));
  }, [assets]);

  /* ================= TOP ASSIGNEES ================= */

  const assigneeData = useMemo(() => {
    const counts = {};

    assets.forEach(a => {
      if (!a.assignee) return;
      counts[a.assignee] = (counts[a.assignee] || 0) + 1;
    });

    return Object.keys(counts)
      .map(key => ({
        name: key,
        value: counts[key]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [assets]);

  const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#22d3ee"];

  return (
    <div>

      <h2 className="text-2xl font-bold text-indigo-400 mb-8">
        IP Landscape & Competitive Intelligence
      </h2>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">

        <KpiCard title="Total Assets" value={totalAssets} color="text-indigo-400" />
        <KpiCard title="Filed" value={filed} color="text-yellow-400" />
        <KpiCard title="Granted" value={granted} color="text-green-400" />
        <KpiCard title="Expired" value={expired} color="text-red-400" />
        <KpiCard title="Grant Rate (%)" value={grantRate} color="text-cyan-400" />

      </div>

      {/* ================= CHART GRID ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* STATUS PIE */}
        <ChartCard title="IP Lifecycle Status Distribution">
          <PieChart width={400} height={300}>
            <Pie
              data={statusData}
              dataKey="value"
              outerRadius={100}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        {/* JURISDICTION BAR */}
        <ChartCard title="Jurisdiction Strength Analysis">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jurisdictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TREND LINE */}
        <ChartCard title="Year-wise Filing Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="filings"
                stroke="#10b981"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TOP ASSIGNEE */}
        <ChartCard title="Top 5 Assignees (Competitor Intelligence)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={assigneeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function KpiCard({ title, value, color }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow">
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>
        {value}
      </h3>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow">
      <h3 className="mb-4 text-indigo-400 font-semibold">
        {title}
      </h3>
      {children}
    </div>
  );
}