import { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";

export default function AnalystExportPage() {

  const token = localStorage.getItem("accessToken");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/ip-assets",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAssets(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  /* ================= COMMON FORMAT ================= */

  const formattedData = assets.map(a => ({
    Title: a.title,
    Inventor: a.inventor,
    Assignee: a.assignee,
    Status: a.status,
    Jurisdiction: a.jurisdiction,
    FilingDate: a.filingDate || a.filing_date
  }));

  /* ================= CSV ================= */

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "IP_Report.csv");
  };

  /* ================= XLSX ================= */

  const exportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IP Report");
    XLSX.writeFile(workbook, "IP_Report.xlsx");
  };

  /* ================= JSON ================= */

  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify(formattedData, null, 2)],
      { type: "application/json" }
    );
    saveAs(blob, "IP_Report.json");
  };

  /* ================= PDF ================= */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("IP Intelligence Report", 14, 15);

    doc.autoTable({
      head: [["Title","Inventor","Assignee","Status","Jurisdiction"]],
      body: formattedData.map(a => [
        a.Title,
        a.Inventor,
        a.Assignee,
        a.Status,
        a.Jurisdiction
      ]),
      startY: 25
    });

    doc.save("IP_Report.pdf");
  };

  /* ================= WORD ================= */

  const exportWord = async () => {

    const tableRows = formattedData.map(a =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(a.Title)] }),
          new TableCell({ children: [new Paragraph(a.Inventor)] }),
          new TableCell({ children: [new Paragraph(a.Assignee)] }),
          new TableCell({ children: [new Paragraph(a.Status)] }),
          new TableCell({ children: [new Paragraph(a.Jurisdiction)] })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph("IP Intelligence Report"),
          new Table({
            rows: tableRows
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "IP_Report.docx");
  };

  return (
    <div>

      <h2 className="text-3xl font-bold text-indigo-400 mb-8">
        Professional Export Center
      </h2>

      <div className="bg-slate-800 p-8 rounded-xl shadow-lg">

        <p className="text-gray-400 mb-6">
          Download IP Intelligence reports in multiple professional formats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <ExportCard title="CSV Export" action={exportCSV} color="bg-green-600" />
          <ExportCard title="Excel (.xlsx)" action={exportXLSX} color="bg-emerald-600" />
          <ExportCard title="PDF Report" action={exportPDF} color="bg-red-600" />
          <ExportCard title="Word Document" action={exportWord} color="bg-blue-600" />
          <ExportCard title="JSON Data" action={exportJSON} color="bg-purple-600" />

        </div>

      </div>

    </div>
  );
}

/* ================= REUSABLE CARD ================= */

function ExportCard({ title, action, color }) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow hover:shadow-2xl transition">
      <h3 className="text-lg font-semibold text-white mb-4">
        {title}
      </h3>
      <button
        onClick={action}
        className={`${color} px-6 py-3 rounded-lg w-full hover:opacity-80 transition`}
      >
        Download
      </button>
    </div>
  );
}