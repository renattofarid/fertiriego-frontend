import SearchInput from "@/components/SearchInput";

interface UnitOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function UnitOptions({ search, setSearch }: UnitOptionsProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchInput
        placeholder="Buscar unidades..."
        value={search}
        onChange={setSearch}
        // className="max-w-sm"
      />
    </div>
  );
}