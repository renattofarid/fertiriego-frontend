import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useJustifications } from "../lib/justification.hook";
import { JustificationColumns } from "./JustificationColumns";
import JustificationOptions from "./JustificationOptions";
import JustificationActions from "./JustificationActions";
import JustificationReviewModal from "./JustificationReviewModal";
import { JUSTIFICATION_META } from "../lib/justification.interface";
import type { JustificationResource } from "../lib/justification.interface";

export default function JustificationPage() {
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
  const [reviewing, setReviewing] = useState<JustificationResource | null>(
    null,
  );

  const params = {
    page,
    per_page,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    person_id: personId ? Number(personId) : undefined,
    status: status || undefined,
  };

  const { data, isLoading, refetch } = useJustifications(params);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, personId, status, per_page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={JUSTIFICATION_META.MODEL.name}
          subtitle={JUSTIFICATION_META.MODEL.description}
          icon={JUSTIFICATION_META.ICON}
        />
        <JustificationActions />
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={JustificationColumns({ onReview: setReviewing })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <JustificationOptions
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
        <JustificationReviewModal
          justification={reviewing}
          open={true}
          onClose={() => setReviewing(null)}
          onReviewed={refetch}
        />
      )}
    </div>
  );
}
