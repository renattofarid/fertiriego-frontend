import { useState } from "react";
import { useSchedules } from "../lib/schedule.hook";
import TitleComponent from "@/components/TitleComponent";
import ScheduleActions from "./ScheduleActions";
import { DataTable } from "@/components/DataTable";
import { ScheduleColumns } from "./ScheduleColumns";
import DataTablePagination from "@/components/DataTablePagination";
import { SCHEDULE, type ScheduleResource } from "../lib/schedule.interface";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import AssignScheduleModal from "./AssignScheduleModal";

const { MODEL, ICON } = SCHEDULE;

export default function SchedulePage() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [assignSchedule, setAssignSchedule] = useState<ScheduleResource | null>(
    null,
  );
  const { data, isLoading } = useSchedules({ page, per_page });

  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <ScheduleActions />
      </div>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={ScheduleColumns({ onAssign: setAssignSchedule })}
          data={data?.data || []}
          isLoading={isLoading}
          initialColumnVisibility={{}}
        />
      </div>

      <DataTablePagination
        page={page}
        totalPages={meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={meta?.total || 0}
      />

      {assignSchedule && (
        <AssignScheduleModal
          open={true}
          onClose={() => setAssignSchedule(null)}
          presetScheduleId={assignSchedule.id}
          presetScheduleName={assignSchedule.name}
        />
      )}
    </div>
  );
}
