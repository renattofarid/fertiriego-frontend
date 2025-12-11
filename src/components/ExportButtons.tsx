"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { Sheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonsProps {
  excelEndpoint?: string;
  pdfEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  variant?: "grouped" | "separate";
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  variant = "grouped",
}: ExportButtonsProps) {
  const handleExcelDownload = async () => {
    if (!excelEndpoint) return;

    try {
      const response = await api.get(excelEndpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", excelFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      toast.error("Error al descargar el archivo Excel");
    }
  };

  const handlePDFDownload = async () => {
    if (!pdfEndpoint) return;

    try {
      const response = await api.get(pdfEndpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error("Error al descargar el archivo PDF");
    }
  };

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg border">
        {excelEndpoint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-0 hover:bg-green-700/5 hover:text-green-700 transition-colors"
                onClick={handleExcelDownload}
              >
                <Sheet className="size-4" />
                Excel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar Excel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {pdfEndpoint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-0 hover:bg-red-700/5 hover:text-red-700 transition-colors"
                onClick={handlePDFDownload}
              >
                <FileText className="size-4" />
                PDF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar PDF</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Variant "separate" - botones individuales sin agrupar
  return (
    <>
      {excelEndpoint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-green-700/5 hover:text-green-700 transition-colors"
              onClick={handleExcelDownload}
            >
              <Sheet className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar Excel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {pdfEndpoint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-red-700/5 hover:text-red-700 transition-colors"
              onClick={handlePDFDownload}
            >
              <FileText className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar PDF</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
