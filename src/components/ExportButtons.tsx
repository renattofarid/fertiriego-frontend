"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import { Sheet, FileDown } from "lucide-react";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "neutral"
  | "tertiary";

interface ExportButtonsProps {
  excelEndpoint?: string;
  pdfEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  onExcelDownload?: () => void | Promise<void>;
  onPdfDownload?: () => void | Promise<void>;
  disableExcel?: boolean;
  disablePdf?: boolean;
  variant?: "grouped" | "separate";
  buttonVariant?: ButtonVariant;
  pdfLabel?: string;
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  onExcelDownload,
  onPdfDownload,
  disableExcel = false,
  disablePdf = false,
  variant = "grouped",
  buttonVariant = "outline",
  pdfLabel = "PDF",
}: ExportButtonsProps) {
  const handleExcelDownload = () => {
    if (onExcelDownload) {
      promiseToast(Promise.resolve(onExcelDownload()), {
        loading: "Descargando Excel...",
        success: "Excel descargado exitosamente",
        error: "Error al descargar el archivo Excel",
      });
      return;
    }

    if (!excelEndpoint) return;

    const download = api
      .get(excelEndpoint, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", excelFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });

    promiseToast(download, {
      loading: "Descargando Excel...",
      success: "Excel descargado exitosamente",
      error: "Error al descargar el archivo Excel",
    });
  };

  const handlePDFDownload = () => {
    if (onPdfDownload) {
      promiseToast(Promise.resolve(onPdfDownload()), {
        loading: "Descargando PDF...",
        success: "PDF descargado exitosamente",
        error: "Error al descargar el archivo PDF",
      });
      return;
    }

    if (!pdfEndpoint) return;

    const download = api
      .get(pdfEndpoint, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", pdfFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });

    promiseToast(download, {
      loading: "Descargando PDF...",
      success: "PDF descargado exitosamente",
      error: "Error al descargar el archivo PDF",
    });
  };

  const showExcelButton = excelEndpoint || onExcelDownload;
  const showPdfButton = pdfEndpoint || onPdfDownload;

  const canColored = ["ghost", "outline"].includes(buttonVariant);

  if (variant === "grouped") {
    return (
      <div className="flex items-center gap-1 bg-muted rounded-lg h-fit">
        {showExcelButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={buttonVariant}
                color={canColored ? "emerald" : undefined}
                onClick={handleExcelDownload}
                disabled={disableExcel}
              >
                <Sheet className="h-4 w-4" />
                Excel
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar Excel</p>
            </TooltipContent>
          </Tooltip>
        )}

        {showPdfButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={buttonVariant}
                color={canColored ? "primary" : undefined}
                onClick={handlePDFDownload}
                disabled={disablePdf}
              >
                <FileDown className="h-4 w-4" />
                {pdfLabel}
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
      {showExcelButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant={buttonVariant}
              color={canColored ? "emerald" : undefined}
              onClick={handleExcelDownload}
              disabled={disableExcel}
            >
              <Sheet className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar Excel</p>
          </TooltipContent>
        </Tooltip>
      )}

      {showPdfButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant={buttonVariant}
              color={canColored ? "primary" : undefined}
              onClick={handlePDFDownload}
              disabled={disablePdf}
            >
              <FileDown className="h-4 w-4" />
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
