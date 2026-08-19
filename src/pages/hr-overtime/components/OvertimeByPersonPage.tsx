import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ArrowLeft, Calculator } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DateRangePickerFilter } from "@/components/DateRangePickerFilter";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useOvertimes } from "../lib/overtime.hook";
import { OvertimeColumns } from "./OvertimeColumns";
import OvertimeReviewModal from "./OvertimeReviewModal";
import OvertimeDetectModal from "./OvertimeDetectModal";
import type { OvertimeResource } from "../lib/overtime.interface";

export default function OvertimeByPersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const personId = Number(id);

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(subMonths(new Date(), 1)),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(subMonths(new Date(), 1)),
  );
  const [reviewing, setReviewing] = useState<OvertimeResource | null>(null);
  const [detecting, setDetecting] = useState(false);

  const params = {
    page,
    per_page,
    person_id: personId,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
  };

  const { data, isLoading, refetch } = useOvertimes(params);
  const personName = data?.data?.[0]?.person_name;

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, per_page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <TitleComponent
            title={personName ?? "Historial de Horas Extras"}
            subtitle="Historial de horas extras del trabajador"
            icon="Timer"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePickerFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            className="w-56"
          />
          <Button onClick={() => setDetecting(true)}>
            <Calculator className="size-4 mr-2" /> Calcular
          </Button>
        </div>
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={OvertimeColumns({ onReview: setReviewing })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        />
      </div>

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

      {detecting && (
        <OvertimeDetectModal
          open={true}
          onClose={() => setDetecting(false)}
          presetPersonId={personId}
          presetPersonName={personName}
        />
      )}
    </div>
  );
}
