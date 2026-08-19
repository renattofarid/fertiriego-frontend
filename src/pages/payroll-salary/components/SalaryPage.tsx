import { useEffect, useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import SearchInput from "@/components/SearchInput";
import { DataTable } from "@/components/DataTable";
import DataTablePagination from "@/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";
import SalaryActions from "./SalaryActions";
import SalaryAddModal from "./SalaryAddModal";
import { SalaryColumns } from "./SalaryColumns";
import { useSalaries } from "../lib/salary.hook";
import { SALARY } from "../lib/salary.interface";

const { MODEL, ICON } = SALARY;

export default function SalaryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [openAdd, setOpenAdd] = useState(false);

  const { data, isLoading, refetch } = useSalaries({ search, page, per_page });

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.name}
          subtitle={MODEL.description}
          icon={ICON}
        />
        <SalaryActions onAdd={() => setOpenAdd(true)} />
      </div>

      <DataTable columns={SalaryColumns()} data={data?.data || []} isLoading={isLoading}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por trabajador..."
        />
      </DataTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />

      <SalaryAddModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          setOpenAdd(false);
          refetch();
        }}
      />
    </div>
  );
}
