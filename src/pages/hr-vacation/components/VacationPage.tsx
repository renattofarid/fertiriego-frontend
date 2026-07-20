import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useVacations } from "../lib/vacation.hook";
import { VacationColumns } from "./VacationColumns";
import VacationOptions from "./VacationOptions";
import VacationActions from "./VacationActions";
import VacationReviewModal from "./VacationReviewModal";
import { VACATION_META } from "../lib/vacation.interface";
import type { VacationResource } from "../lib/vacation.interface";

export default function VacationPage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date()),
  );
  const [personId, setPersonId] = useState("");
  const [status, setStatus] = useState("");
  const [reviewing, setReviewing] = useState<VacationResource | null>(null);

  const params = {
    page,
    per_page,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    person_id: personId ? Number(personId) : undefined,
    status: status || undefined,
  };

  const { data, isLoading, refetch } = useVacations(params);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, personId, status, per_page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={VACATION_META.MODEL.name}
          subtitle={VACATION_META.MODEL.description}
          icon={VACATION_META.ICON}
        />
        <VacationActions />
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={VacationColumns({ onReview: setReviewing })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <VacationOptions
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

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      {reviewing && (
        <VacationReviewModal
          vacation={reviewing}
          open={true}
          onClose={() => setReviewing(null)}
          onReviewed={refetch}
        />
      )}
    </div>
  );
}
