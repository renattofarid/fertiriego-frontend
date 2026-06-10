import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useProductionDocuments } from "../lib/production-document.hook";
import {
  PRODUCTION_DOCUMENT,
  PRODUCTION_DOCUMENT_STATUSES,
} from "../lib/production-document.interface";
import { createProductionDocumentColumns } from "./ProductionDocumentColumns";
import FormWrapper from "@/components/FormWrapper";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Plus } from "lucide-react";
import type { GetProductionDocumentsParams } from "../lib/production-document.interface";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";
import FilterWrapper from "@/components/FilterWrapper";
import SearchInput from "@/components/SearchInput";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useAllWarehouses } from "@/pages/warehouse/lib/warehouse.hook";
import type { Option } from "@/lib/core.interface";

export default function ProductionDocumentIndexPage() {
  const { ROUTE_ADD, MODEL, ICON } = PRODUCTION_DOCUMENT;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Filtros
  const [documentNumber, setDocumentNumber] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [warehouseOriginId, setWarehouseOriginId] = useState("");
  const [warehouseDestId, setWarehouseDestId] = useState("");

  const { data: warehousesData } = useAllWarehouses();
  const warehouses = warehousesData ?? [];

  const params: GetProductionDocumentsParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(documentNumber && { document_number: documentNumber }),
      ...(status && { status }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
      ...(warehouseOriginId && { warehouse_origin_id: Number(warehouseOriginId) }),
      ...(warehouseDestId && { warehouse_dest_id: Number(warehouseDestId) }),
    }),
    [page, perPage, documentNumber, status, dateFrom, dateTo, warehouseOriginId, warehouseDestId]
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

  const statusOptions: Option[] = [
    { value: "", label: "Todos los estados" },
    ...PRODUCTION_DOCUMENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  const warehouseOptions: Option[] = [
    { value: "", label: "Todos" },
    ...warehouses.map((w) => ({ value: w.id.toString(), label: w.name })),
  ];

  const extraActiveCount = [dateFrom, dateTo, warehouseOriginId, warehouseDestId].filter(Boolean).length;

  if (isLoading && !documents) {
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
        <Button onClick={() => navigate(ROUTE_ADD)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      <div className="mb-4">
        <FilterWrapper maxVisible={2} activeExtraCount={extraActiveCount}>
          <SearchInput
            value={documentNumber}
            onChange={(v) => { setDocumentNumber(v); setPage(1); }}
            placeholder="N° Documento..."
          />

          <SearchableSelect
            options={statusOptions}
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            placeholder="Estado"
            className="w-full md:w-[180px]"
          />

          {/* Extras (en sheet) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Fecha desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Fecha hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <SearchableSelect
            options={warehouseOptions}
            value={warehouseOriginId}
            onChange={(v) => { setWarehouseOriginId(v); setPage(1); }}
            placeholder="Almacén Origen"
            className="w-full md:w-[200px]"
          />

          <SearchableSelect
            options={warehouseOptions}
            value={warehouseDestId}
            onChange={(v) => { setWarehouseDestId(v); setPage(1); }}
            placeholder="Almacén Destino"
            className="w-full md:w-[200px]"
          />
        </FilterWrapper>
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
