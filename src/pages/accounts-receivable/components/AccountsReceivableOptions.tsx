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
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder="Buscar cuenta por cobrar..."
    />
  );
}
