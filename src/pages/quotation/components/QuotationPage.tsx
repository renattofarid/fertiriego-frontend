"use client";

import { useState } from "react";
import { useQuotation } from "../lib/quotation.hook";
import QuotationTable from "./QuotationTable";
import { getQuotationColumns } from "./QuotationColumns";
import { useQuotationStore } from "../lib/quotation.store";
import { useNavigate } from "react-router-dom";
import { QUOTATION, type QuotationResource } from "../lib/quotation.interface";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import TitleComponent from "@/components/TitleComponent";
import PageWrapper from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ExportButtons from "@/components/ExportButtons";

export default function QuotationPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<number | null>(
    null
  );

  const {
    data: quotations,
    isLoading,
    refetch,
  } = useQuotation({
    search,
  });

  const { removeQuotation } = useQuotationStore();

  const handleEdit = (quotation: QuotationResource) => {
    navigate(`/cotizaciones/actualizar/${quotation.id}`);
  };

  const handleDelete = (id: number) => {
    setQuotationToDelete(id);
    setOpenDelete(true);
  };

  const handleViewDetails = async (quotation: QuotationResource) => {
    navigate(`/cotizaciones/${quotation.id}`);
  };

  const handleGenerateSale = (quotation: QuotationResource) => {
    navigate(`/ventas/agregar?quotation_id=${quotation.id}`);
  };

  const confirmDelete = async () => {
    if (quotationToDelete) {
      try {
        await removeQuotation(quotationToDelete);
        refetch();
        setOpenDelete(false);
        setQuotationToDelete(null);
      } catch (error) {
        console.error("Error al eliminar cotización", error);
      }
    }
  };

  const { MODEL, ICON } = QUOTATION;

  const columns = getQuotationColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    onGenerateSale: handleGenerateSale,
  });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <TitleComponent
          title={MODEL.name}
          subtitle="Administrar todas las cotizaciones registradas en el sistema"
          icon={ICON}
        />
        <div className="flex items-center gap-2">
          <ExportButtons
            excelEndpoint="/quotation/export"
            excelFileName="cotizaciones.xlsx"
          />
          <Button size={"sm"} onClick={() => navigate("/cotizaciones/agregar")}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Cotización
          </Button>
        </div>
      </div>

      <QuotationTable
        columns={columns}
        data={quotations || []}
        isLoading={isLoading}
      >
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Buscar cotizaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </QuotationTable>

      <SimpleDeleteDialog
        open={openDelete}
        onOpenChange={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </PageWrapper>
  );
}
