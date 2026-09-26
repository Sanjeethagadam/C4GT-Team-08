import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileDown, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ctpoService } from "@/services/ctpoService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ExportButton = ({ endpoint, filename, title, params = {} }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      if (format === "excel") {
        const blob = await ctpoService.exportData(endpoint, "excel", params);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (format === "pdf") {
        const response = await ctpoService.exportData(endpoint, "pdf", params);
        const data = response.data || response; // Interceptor may already return response.data
        if (!data || (Array.isArray(data) && data.length === 0)) {
          alert("No data available to export.");
          return;
        }

        const doc = new jsPDF("landscape");
        doc.setFontSize(18);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

        // Handle Array data (e.g. Roster, Backlogs, Risk, Marks)
        if (Array.isArray(data)) {
          const keys = Object.keys(data[0]);
          const rows = data.map((item) =>
            keys.map((k) => (item[k] === null || item[k] === undefined ? "" : String(item[k]))),
          );
          autoTable(doc, {
            head: [keys],
            body: rows,
            startY: 25,
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 66, 66] },
          });
        } else {
          // Handle complex Object data (e.g. Student Profile)
          let currentY = 30;
          if (data.identity) {
            autoTable(doc, {
              head: [["Identity Field", "Value"]],
              body: Object.entries(data.identity).map(([k, v]) => [
                k,
                v === null || v === undefined ? "" : String(v),
              ]),
              startY: currentY,
              theme: "grid",
            });
            currentY = doc.lastAutoTable.finalY + 10;
          }
          if (data.backlogs && data.backlogs.length > 0) {
            doc.text("Active Backlogs", 14, currentY);
            autoTable(doc, {
              head: [Object.keys(data.backlogs[0])],
              body: data.backlogs.map((b) =>
                Object.values(b).map((v) => (v === null || v === undefined ? "" : String(v))),
              ),
              startY: currentY + 5,
              theme: "grid",
            });
            currentY = doc.lastAutoTable.finalY + 10;
          }
          if (data.marks && data.marks.length > 0) {
            doc.text("Internal Marks", 14, currentY);
            autoTable(doc, {
              head: [Object.keys(data.marks[0])],
              body: data.marks.map((m) =>
                Object.values(m).map((v) => (v === null || v === undefined ? "" : String(v))),
              ),
              startY: currentY + 5,
              theme: "grid",
            });
            currentY = doc.lastAutoTable.finalY + 10;
          }
          if (data.results && data.results.length > 0) {
            doc.text("Official Results", 14, currentY);
            autoTable(doc, {
              head: [Object.keys(data.results[0])],
              body: data.results.map((r) =>
                Object.values(r).map((v) => (v === null || v === undefined ? "" : String(v))),
              ),
              startY: currentY + 5,
              theme: "grid",
            });
          }
        }

        doc.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert(
        "Failed to export data: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="bg-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          className="cursor-pointer"
        >
          <FileDown className="w-4 h-4 mr-2 text-green-600" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
