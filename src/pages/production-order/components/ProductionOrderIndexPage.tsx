import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useProductionOrders } from "../lib/production-order.hook";
import { PRODUCTION_ORDER } from "../lib/production-order.interface";
import type { GetProductionOrdersParams } from "../lib/production-order.interface";
import { createProductionOrderColumns } from "./ProductionOrderColumns";
import FormWrapper from "@/components/FormWrapper";
import PageSkeleton from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { Plus } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import DataTablePagination from "@/components/DataTablePagination";

export default function ProductionOrderIndexPage() {
  const { ROUTE_ADD, ROUTE, MODEL, ICON } = PRODUCTION_ORDER;
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const params: GetProductionOrdersParams = useMemo(
    () => ({ page, per_page: perPage }),
    [page, perPage]
  );

  const { data: orders, meta, isLoading } = useProductionOrders(params);

  const columns = useMemo(
    () => createProductionOrderColumns((id) => navigate(`${ROUTE}/${id}`)),
    [navigate, ROUTE]
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
          title={MODEL.plural ?? "Órdenes de Producción"}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <Button onClick={() => navigate(ROUTE_ADD)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Orden
        </Button>
      </div>

      <div className="space-y-4">
        <DataTable columns={columns} data={orders ?? []} />
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
