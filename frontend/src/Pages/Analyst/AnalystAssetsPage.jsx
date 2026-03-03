import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AnalystAssetsPage() {

  const token = localStorage.getItem("accessToken");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
      setLoading(false);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Granted":
        return "bg-green-600";
      case "Filed":
        return "bg-yellow-600";
      case "Expired":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div>

      <h2 className="text-3xl font-bold text-indigo-400 mb-8">
        IP Asset Repository
      </h2>

      {loading && (
        <p className="text-gray-400">Loading assets...</p>
      )}

      {!loading && assets.length === 0 && (
        <p className="text-gray-400">No IP assets found.</p>
      )}

      {!loading && assets.length > 0 && (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-x-auto">

          <table className="w-full text-sm text-left">

            <thead className="bg-slate-900 text-gray-300">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Inventor</th>
                <th className="px-6 py-4">Assignee</th>
                <th className="px-6 py-4">Jurisdiction</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {assets.map(asset => (
                <tr
                  key={asset.id}
                  className="border-b border-slate-700 hover:bg-slate-700 transition"
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {asset.title}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.inventor}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.assignee}
                  </td>

                  <td className="px-6 py-4 text-gray-400">
                    {asset.jurisdiction}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full text-white ${getStatusColor(asset.status)}`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-xs"
                    >
                      View Details
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}