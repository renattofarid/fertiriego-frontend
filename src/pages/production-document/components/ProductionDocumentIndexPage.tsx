import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useProductionDocuments } from "../lib/production-document.hook";
import { PRODUCTION_DOCUMENT } from "../lib/production-document.interface";
import { createProductionDocumentColumns } from "./ProductionDocumentColumns";
import FormWrapper from "@/components/FormWrapper";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Plus } from "lucide-react";
import type { GetProductionDocumentsParams } from "../lib/production-document.interface";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";

export default function ProductionDocumentIndexPage() {
  const { ROUTE_ADD, MODEL, ICON } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const params: GetProductionDocumentsParams = useMemo(
    () => ({ page, per_page: perPage }),
    [page, perPage]
  );

  const { data: documents, meta, isLoading } = useProductionDocuments(params);

  const columns = useMemo(
    () =>
      createProductionDocumentColumns((id) =>
        navigate(`/documentos-produccion/${id}`)
      ),
    [navigate]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <FormWrapper>
      <div className="mb-6 flex items-center justify-between">
        <TitleComponent
          title={MODEL.plural ?? "Documentos de Producción"}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <Button  onClick={() => navigate(ROUTE_ADD)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      <div className="space-y-4">
        <DataTable columns={columns} data={documents ?? []} />
        {meta && (
          <DataTablePagination
            page={page}
            per_page={meta.per_page ?? perPage}
            totalPages={meta.last_page}
            totalData={meta.total}
            onPageChange={handlePageChange}
            setPerPage={setPerPage}
          />
        )}
      </div>
    </FormWrapper>
  );
}
