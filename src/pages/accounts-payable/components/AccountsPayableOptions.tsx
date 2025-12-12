import SearchInput from "@/components/SearchInput";

interface AccountsPayableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function AccountsPayableOptions({
  search,
  setSearch,
}: AccountsPayableOptionsProps) {
  return (
    <SearchInput
      value={search}
      onChange={setSearch}
      placeholder="Buscar cuenta por pagar..."
    />
  );
}
