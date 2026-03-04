import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_COLORS = {
  ACTIVE: "bg-green-600",
  PENDING: "bg-yellow-500",
  GRANTED: "bg-blue-600",
  DISCONTINUED: "bg-red-600",
};

export default function UserDashboard() {
  const navigate = useNavigate();

  /* ── Restore saved search state from sessionStorage ── */
  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem("user_search_state") || "null"); }
    catch { return null; }
  })();

  const [user, setUser] = useState(null);
  const [results, setResults] = useState(saved?.results || []);
  const [total, setTotal] = useState(saved?.total ?? null);
  const [searched, setSearched] = useState(saved?.searched || false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(saved?.page || 0);

  const [keyword, setKeyword] = useState(saved?.keyword || "");
  const [jurisdiction, setJurisdiction] = useState(saved?.jurisdiction || "");
  const [inventor, setInventor] = useState(saved?.inventor || "");
  const [assignee, setAssignee] = useState(saved?.assignee || "");
  const [status, setStatus] = useState(saved?.status || "");

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  /* ── Auth check ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!token || role !== "USER") {
      navigate("/login");
      return;
    }
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user/me");
      setUser(res.data);
    } catch {
      localStorage.clear();
      navigate("/login");
    }
  };

  /* ── Search ──────────────────────────────────────────────────── */
  const handleSearch = async (overridePage = 0) => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearched(true);
    setPage(overridePage);
    try {
      const params = new URLSearchParams({
        q: keyword.trim(),
        type: "PATENT",
        page: overridePage,
        size: 10,
      });
      if (jurisdiction) params.set("jurisdiction", jurisdiction);

      const res = await api.get("/api/search", { params });
      setResults(res.data.results || []);
      setTotal(res.data.total ?? null);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setKeyword("");
    setJurisdiction("");
    setInventor("");
    setAssignee("");
    setStatus("");
    setResults([]);
    setSearched(false);
    setTotal(null);
    setPage(0);
    sessionStorage.removeItem("user_search_state");
  };

  /* ── Save search state to sessionStorage whenever results change ── */
  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem("user_search_state", JSON.stringify({
        keyword, jurisdiction, inventor, assignee, status, page, results, total, searched
      }));
    }
  }, [results]);

  /* ── Client-side filter on top of API results ── */
  const filteredResults = results.filter(r =>
    (inventor === "" || r.inventors?.some(i => i.toLowerCase().includes(inventor.toLowerCase()))) &&
    (assignee === "" || r.applicants?.some(a => a.toLowerCase().includes(assignee.toLowerCase()))) &&
    (status === "" || r.patentStatus === status)
  );

  /* ── Unique statuses from current results ── */
  const uniqueStatuses = [...new Set(results.map(r => r.patentStatus).filter(Boolean))].sort();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 md:px-10 py-10">

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-indigo-400">
          Welcome, {user.username}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg shadow transition"
        >
          Logout
        </button>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="bg-slate-800 p-6 rounded-2xl mb-8 shadow-xl">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4">
          Search Patents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Keyword (e.g. artificial intelligence)"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(0)}
            className="bg-slate-700 p-2 rounded col-span-1 md:col-span-2"
          />

          <select
            value={jurisdiction}
            onChange={e => setJurisdiction(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          >
            <option value="">All Jurisdictions</option>
            <option value="US">US</option>
            <option value="IN">IN</option>
            <option value="CN">CN</option>
            <option value="EP">EP</option>
            <option value="WO">WO (PCT)</option>
            <option value="KR">KR</option>
            <option value="JP">JP</option>
            <option value="DE">DE</option>
            <option value="GB">GB</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <input
            type="text"
            placeholder="Inventor (e.g. John Doe)"
            value={inventor}
            onChange={e => setInventor(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          />
          <input
            type="text"
            placeholder="Assignee (e.g. Google)"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="bg-slate-700 p-2 rounded"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => handleSearch(0)}
            disabled={loading || !keyword.trim()}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Searching…" : "Search"}
          </button>
          <button
            onClick={handleClear}
            className="border border-gray-500 px-6 py-2 rounded hover:bg-slate-700 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── STATES ── */}
      {!searched && (
        <p className="text-gray-500 text-center">
          Enter a keyword and click Search to find patents.
        </p>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-gray-400 text-center">No patents found.</p>
      )}

      {/* ── RESULTS ── */}
      {results.length > 0 && (
        <>
          <p className="text-gray-400 text-sm mb-4">
            {total !== null
              ? `Showing ${(page * 10 + 1).toLocaleString()}–${(page * 10 + filteredResults.length).toLocaleString()} of ${total.toLocaleString()} total patents`
              : `Showing ${filteredResults.length} results`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredResults.map(r => (
              <div
                key={r.lensId}
                className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-500 border border-transparent transition"
              >
                {/* Type badge */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="text-xs bg-indigo-800 text-indigo-300 px-2 py-0.5 rounded">
                    {r.publicationType?.replace("_", " ")}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded text-white ${STATUS_COLORS[r.patentStatus] || "bg-gray-600"}`}>
                    {r.patentStatus}
                  </span>
                </div>

                <h3 className="text-indigo-400 font-semibold text-base mb-3 line-clamp-2">
                  {r.title}
                </h3>

                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-gray-300">Applicant:</span>{" "}
                  {r.applicants?.join(", ") || "N/A"}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  <span className="text-gray-300">Inventor:</span>{" "}
                  {r.inventors?.join(", ") || "N/A"}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  <span className="text-gray-300">Jurisdiction:</span> {r.jurisdiction} &nbsp;|&nbsp;
                  <span className="text-gray-300">Published:</span> {r.datePublished}
                </p>

                <button
                  onClick={() =>
                    navigate(`/assets/${r.lensId}`, { state: { from: "USER" } })
                  }
                  className="bg-indigo-600 px-4 py-1.5 rounded hover:bg-indigo-700 text-sm transition"
                >
                  View Details →
                </button>
              </div>
            ))}
          </div>

          {/* ── PAGINATION ── */}
          <div className="flex justify-center items-center gap-4">
            <button
              disabled={page === 0 || loading}
              onClick={() => handleSearch(page - 1)}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-gray-300 font-medium">
              Page {page + 1}
              {total !== null && ` of ${Math.ceil(total / 10).toLocaleString()}`}
            </span>
            <button
              disabled={results.length < 10 || loading}
              onClick={() => handleSearch(page + 1)}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40 transition"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}