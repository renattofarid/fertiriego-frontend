import SearchInput from "@/components/SearchInput";

interface AccountsReceivableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function AccountsReceivableOptions({
  search,
  setSearch,
}: AccountsReceivableOptionsProps) {
  return (
    <div className="flex items-center gap-2 py-4">
      <div className="relative flex-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar cuenta por cobrar..."
        />
      </div>
    </div>
  );
}
