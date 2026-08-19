import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { CheckCheck, X } from "lucide-react";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useOvertimes } from "../lib/overtime.hook";
import { OvertimeColumns } from "./OvertimeColumns";
import OvertimeOptions from "./OvertimeOptions";
import OvertimeActions from "./OvertimeActions";
import OvertimeReviewModal from "./OvertimeReviewModal";
import OvertimeBulkReviewModal from "./OvertimeBulkReviewModal";
import { OVERTIME_META } from "../lib/overtime.interface";
import type { OvertimeResource } from "../lib/overtime.interface";

export default function OvertimePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(subMonths(new Date(), 1)),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(subMonths(new Date(), 1)),
  );
  const [personId, setPersonId] = useState("");
  const [status, setStatus] = useState("");
  const [reviewing, setReviewing] = useState<OvertimeResource | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkAction, setBulkAction] = useState(false);

  const params = {
    page,
    per_page,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    person_id: personId ? Number(personId) : undefined,
    status: status || undefined,
  };

  const { data, isLoading, refetch } = useOvertimes(params);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, personId, status, per_page]);

  useEffect(() => {
    setRowSelection({});
  }, [data]);

  const selectedIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number),
    [rowSelection],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={OVERTIME_META.MODEL.name}
          subtitle={OVERTIME_META.MODEL.description}
          icon={OVERTIME_META.ICON}
        />
        <OvertimeActions />
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={OvertimeColumns({ onReview: setReviewing, enableSelection: true })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          enableRowSelection
          getRowId={(row) => String(row.id)}
        >
          <OvertimeOptions
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            personId={personId}
            setPersonId={setPersonId}
            status={status}
            setStatus={setStatus}
          />
        </DataTable>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} seleccionado(s)
          </span>
          <Button variant="outline" onClick={() => setRowSelection({})}>
            <X className="size-4 mr-2" /> Limpiar selección
          </Button>
          <Button onClick={() => setBulkAction(true)}>
            <CheckCheck className="size-4 mr-2" /> Revisar seleccionados
          </Button>
        </div>
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {reviewing && (
        <OvertimeReviewModal
          overtime={reviewing}
          open={true}
          onClose={() => setReviewing(null)}
          onReviewed={refetch}
        />
      )}

      {bulkAction && (
        <OvertimeBulkReviewModal
          ids={selectedIds}
          open={true}
          onClose={() => setBulkAction(false)}
          onReviewed={() => {
            setRowSelection({});
            refetch();
          }}
        />
      )}
    </div>
  );
}
