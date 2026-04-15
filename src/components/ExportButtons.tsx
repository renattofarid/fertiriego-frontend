"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { api } from "@/lib/config";
import { promiseToast } from "@/lib/core.function";
import { Sheet, FileDown, ReceiptText } from "lucide-react";

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
  ticketEndpoint?: string;
  excelFileName?: string;
  pdfFileName?: string;
  ticketFileName?: string;
  downloadPdf?: boolean;
  downloadTicket?: boolean;
  onExcelDownload?: () => void | Promise<void>;
  onPdfDownload?: () => void | Promise<void>;
  onTicketDownload?: () => void | Promise<void>;
  disableExcel?: boolean;
  disablePdf?: boolean;
  disableTicket?: boolean;
  variant?: "grouped" | "separate";
  buttonVariant?: ButtonVariant;
  pdfLabel?: string;
  ticketLabel?: string;
}

export default function ExportButtons({
  excelEndpoint,
  pdfEndpoint,
  ticketEndpoint,
  excelFileName = "export.xlsx",
  pdfFileName = "export.pdf",
  ticketFileName = "ticket.pdf",
  downloadPdf = false,
  downloadTicket = false,
  onExcelDownload,
  onPdfDownload,
  onTicketDownload,
  disableExcel = false,
  disablePdf = false,
  disableTicket = false,
  variant = "grouped",
  buttonVariant = "outline",
  pdfLabel = "PDF",
  ticketLabel = "Ticket",
}: ExportButtonsProps) {
  const downloadFile = async (endpoint: string, fileName: string) => {
    const response = await api.get(endpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const openPdfInNewTab = async (endpoint: string) => {
    const response = await api.get(endpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    window.open(url, "_blank");
  };

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

    const download = downloadFile(excelEndpoint, excelFileName);

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

    const download = downloadPdf
      ? downloadFile(pdfEndpoint, pdfFileName)
      : openPdfInNewTab(pdfEndpoint);

    promiseToast(download, {
      loading: downloadPdf ? "Descargando PDF..." : "Abriendo PDF...",
      success: downloadPdf ? "PDF descargado exitosamente" : "PDF abierto exitosamente",
      error: downloadPdf ? "Error al descargar el archivo PDF" : "Error al abrir el archivo PDF",
    });
  };

  const handleTicketDownload = () => {
    if (onTicketDownload) {
      promiseToast(Promise.resolve(onTicketDownload()), {
        loading: "Descargando ticket...",
        success: "Ticket descargado exitosamente",
        error: "Error al descargar el ticket",
      });
      return;
    }

    if (!ticketEndpoint) return;

    const download = downloadTicket
      ? downloadFile(ticketEndpoint, ticketFileName)
      : openPdfInNewTab(ticketEndpoint);

    promiseToast(download, {
      loading: downloadTicket ? "Descargando ticket..." : "Abriendo ticket...",
      success: downloadTicket ? "Ticket descargado exitosamente" : "Ticket abierto exitosamente",
      error: downloadTicket ? "Error al descargar el ticket" : "Error al abrir el ticket",
    });
  };

  const showExcelButton = excelEndpoint || onExcelDownload;
  const showPdfButton = pdfEndpoint || onPdfDownload;
  const showTicketButton = ticketEndpoint || onTicketDownload;

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

        {showTicketButton && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={buttonVariant}
                color={canColored ? "orange" : undefined}
                onClick={handleTicketDownload}
                disabled={disableTicket}
              >
                <ReceiptText className="h-4 w-4" />
                {ticketLabel}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar ticket</p>
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

      {showTicketButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant={buttonVariant}
              color={canColored ? "orange" : undefined}
              onClick={handleTicketDownload}
              disabled={disableTicket}
            >
              <ReceiptText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Descargar ticket</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
