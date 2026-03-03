export default function AnalystSidebar({ activeTab, setActiveTab }) {

  const tabs = [
    "dashboard",
    "search",
    "tracker",
    "notifications",
    "analytics",
    "export"
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen p-6 fixed left-0 top-0">
      <h2 className="text-xl font-bold text-indigo-400 mb-8">
        Analyst Panel
      </h2>

      <div className="space-y-3">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full text-left px-4 py-2 rounded-lg capitalize transition
              ${activeTab === tab
                ? "bg-indigo-600"
                : "bg-slate-700 hover:bg-slate-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}