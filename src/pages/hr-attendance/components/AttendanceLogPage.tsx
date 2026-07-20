import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { RefreshCw } from "lucide-react";
import TitleComponent from "@/components/TitleComponent";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import { useAttendanceLogs } from "../lib/attendance.hook";
import { AttendanceColumns } from "./AttendanceColumns";
import AttendanceOptions from "./AttendanceOptions";
import { ATTENDANCE_META } from "../lib/attendance.interface";

export default function AttendanceLogPage() {
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

  const params = {
    page,
    per_page,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_until: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    person_id: personId ? Number(personId) : undefined,
    status: status || undefined,
  };

  const { data, isLoading, isFetching, refetch } = useAttendanceLogs(params);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, personId, status, per_page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={ATTENDANCE_META.MODEL.name}
          subtitle={ATTENDANCE_META.MODEL.description}
          icon={ATTENDANCE_META.ICON}
        />
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`size-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={AttendanceColumns}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        >
          <AttendanceOptions
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
    </div>
  );
}
