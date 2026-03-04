import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const STATUS_COLORS = {
  ACTIVE: "text-green-400",
  PENDING: "text-yellow-400",
  GRANTED: "text-blue-400",
  DISCONTINUED: "text-red-400",
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const role = localStorage.getItem("role");
  const from = location.state?.from;

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // Public endpoint — no token needed
        const res = await api.get(`/api/assets/${id}`);
        setAsset(res.data);
      } catch (err) {
        console.error("Detail fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleBack = () => {
    if (from === "ANALYST") return navigate("/analyst");
    if (from === "USER") return navigate("/user");
    if (role === "ANALYST") return navigate("/analyst");
    if (role === "ADMIN") return navigate("/admin");
    navigate("/user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg animate-pulse">Loading patent details…</p>
      </div>
    );

  if (error || !asset)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg">Could not load patent details.</p>
        <button
          onClick={handleBack}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition"
        >
          ← Go Back
        </button>
      </div>
    );

  // Extract fields from Lens.org response
  const biblio = asset.biblio || {};
  const title = biblio?.invention_title?.[0]?.text
    ?? asset.title
    ?? "Untitled Patent";
  const inventors = biblio?.parties?.inventors?.map(i => i.extracted_name?.value).filter(Boolean)
    ?? asset.inventors
    ?? [];
  const applicants = biblio?.parties?.applicants?.map(a => a.extracted_name?.value).filter(Boolean)
    ?? asset.applicants
    ?? [];
  const docNumber = biblio?.publication_reference?.doc_number ?? asset.docNumber ?? asset.lens_id ?? id;
  const jurisdiction = asset.jurisdiction;
  const datePublished = asset.date_published ?? asset.datePublished;
  const abstract = asset.abstract?.[0]?.text ?? asset.abstract ?? "N/A";
  const patentStatus = asset.legal?.patent_status ?? asset.patentStatus ?? "—";
  const pubType = asset.publicationType ?? asset.doc_type ?? "—";
  const kind = biblio?.publication_reference?.kind ?? asset.kind ?? "";
  const appNumber = biblio?.application_reference?.doc_number ?? "";
  const appDate = biblio?.application_reference?.date ?? "";

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 md:px-10 py-10">

      {/* ── BACK ── */}
      <button
        onClick={handleBack}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded transition text-sm"
      >
        ← Back to Dashboard
      </button>

      {/* ── TITLE + STATUS ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start gap-4 justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 max-w-3xl leading-snug">
          {title}
        </h1>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-lg font-semibold ${STATUS_COLORS[patentStatus] || "text-gray-300"}`}>
            {patentStatus}
          </span>
          <span className="text-xs bg-indigo-800 text-indigo-300 px-3 py-1 rounded">
            {pubType.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* ── KEY INFO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Publication Number" value={`${jurisdiction} ${docNumber} ${kind}`} />
        <InfoCard label="Jurisdiction" value={jurisdiction} />
        <InfoCard label="Date Published" value={datePublished} />
        <InfoCard label="Application Number" value={appNumber || "N/A"} />
        <InfoCard label="Application Date" value={appDate || "N/A"} />
        <InfoCard label="Lens ID" value={asset.lens_id ?? id} mono />
      </div>

      {/* ── PARTIES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <PartyCard label="Applicants" items={applicants} />
        <PartyCard label="Inventors" items={inventors} />
      </div>

      {/* ── ABSTRACT ── */}
      <div className="bg-slate-800 p-6 rounded-xl mb-8">
        <h2 className="text-lg font-semibold text-indigo-400 mb-3">Abstract</h2>
        <p className="text-gray-300 leading-relaxed text-sm">{abstract}</p>
      </div>

      {/* ── CLASSIFICATIONS ── */}
      {biblio?.classifications_cpc?.classifications?.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-indigo-400 mb-3">CPC Classifications</h2>
          <div className="flex flex-wrap gap-2">
            {biblio.classifications_cpc.classifications.map((c, i) => (
              <span key={i} className="bg-slate-700 px-3 py-1 rounded text-xs text-gray-300">
                {c.symbol}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small components ── */
function InfoCard({ label, value, mono }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`font-semibold text-sm ${mono ? "font-mono text-indigo-300" : ""}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

function PartyCard({ label, items }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {items.length === 0
        ? <p className="text-sm text-gray-500">N/A</p>
        : <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-200">
              {i + 1}. {item}
            </li>
          ))}
        </ul>
      }
    </div>
  );
}
