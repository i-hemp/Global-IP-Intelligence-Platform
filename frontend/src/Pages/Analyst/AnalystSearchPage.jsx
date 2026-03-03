import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AnalystSearchPage() {

  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [inventor, setInventor] = useState("");
  const [assignee, setAssignee] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [status, setStatus] = useState("");

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {

    setLoading(true);
    setSearched(true);

    try {
      const response = await axios.get(
        "http://localhost:8081/api/ip-assets",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      let data = response.data || [];

      // 🔥 Frontend filtering (ALL MATCHED RESULTS)
      data = data.filter(a =>
        (keyword === "" || a.title?.toLowerCase().includes(keyword.toLowerCase())) &&
        (inventor === "" || a.inventor?.toLowerCase().includes(inventor.toLowerCase())) &&
        (assignee === "" || a.assignee?.toLowerCase().includes(assignee.toLowerCase())) &&
        (jurisdiction === "" || a.jurisdiction === jurisdiction) &&
        (status === "" || a.status === status)
      );

      setAssets(data);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const clearFilters = () => {
    setKeyword("");
    setInventor("");
    setAssignee("");
    setJurisdiction("");
    setStatus("");
    setAssets([]);
    setSearched(false);
  };

  return (
    <div>

      <h2 className="text-2xl text-indigo-400 mb-6">
        Advanced IP Search
      </h2>

      {/* FILTER SECTION */}
      <div className="bg-slate-800 p-6 rounded-2xl mb-8 shadow-xl">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-slate-700 p-3 rounded"
          />

          <input
            type="text"
            placeholder="Inventor"
            value={inventor}
            onChange={(e) => setInventor(e.target.value)}
            className="bg-slate-700 p-3 rounded"
          />

          <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="bg-slate-700 p-3 rounded"
          />

          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            className="bg-slate-700 p-3 rounded"
          >
            <option value="">All Jurisdictions</option>
            <option value="US">US</option>
            <option value="IN">IN</option>
            <option value="EU">EU</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-700 p-3 rounded"
          >
            <option value="">All Status</option>
            <option value="Filed">Filed</option>
            <option value="Granted">Granted</option>
            <option value="Expired">Expired</option>
          </select>

        </div>

        <div className="flex gap-4 mt-6">

          <button
            onClick={handleSearch}
            className="bg-indigo-600 px-6 py-2 rounded hover:bg-indigo-700"
          >
            Search
          </button>

          <button
            onClick={clearFilters}
            className="border border-gray-500 px-6 py-2 rounded hover:bg-slate-700"
          >
            Clear
          </button>

        </div>

      </div>

      {/* RESULTS */}

      {loading && <p className="text-gray-400">Searching...</p>}

      {!searched && (
        <p className="text-gray-500 text-center">
          Fill filters and click Search to view results.
        </p>
      )}

      {searched && !loading && assets.length === 0 && (
        <p className="text-gray-400 text-center">
          No matching assets found.
        </p>
      )}

      {assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {assets.map(asset => (
            <div
              key={asset.id}
              onClick={() => navigate(`/analyst/assets/${asset.id}`)}
              className="bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer hover:bg-slate-700"
            >
              <h3 className="text-indigo-400 font-semibold text-lg mb-2">
                {asset.title}
              </h3>

              <p className="text-sm text-gray-400 mb-1">
                Inventor: {asset.inventor}
              </p>
              <p className="text-sm text-gray-400 mb-1">
                Assignee: {asset.assignee}
              </p>
              <p className="text-sm text-gray-400 mb-1">
                Status: {asset.status}
              </p>
              <p className="text-sm text-gray-400">
                Jurisdiction: {asset.jurisdiction}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}