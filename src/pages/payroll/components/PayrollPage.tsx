import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import PayrollActions from "./PayrollActions";
import CalculatePayrollSheet from "./CalculatePayrollSheet";
import { PayrollColumns } from "./PayrollColumns";
import { usePayrolls } from "../lib/payroll.hook";
import { PAYROLL } from "../lib/payroll.interface";

const { MODEL, ICON } = PAYROLL;

export default function PayrollPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openCalculate, setOpenCalculate] = useState(false);

  const { data, isLoading, refetch } = usePayrolls({ page, per_page });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural ?? MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <PayrollActions onCalculate={() => setOpenCalculate(true)} />
      </div>

      <DataTable
        columns={PayrollColumns({
          onView: (payroll) =>
            navigate(`${PAYROLL.ROUTE}/${payroll.id}`, { state: { payroll } }),
        })}
        data={data?.data || []}
        isLoading={isLoading}
      />

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <CalculatePayrollSheet
        open={openCalculate}
        onClose={() => setOpenCalculate(false)}
        onSuccess={(payrollId) => {
          setOpenCalculate(false);
          refetch();
          navigate(`${PAYROLL.ROUTE}/${payrollId}`);
        }}
      />
    </div>
  );
}
