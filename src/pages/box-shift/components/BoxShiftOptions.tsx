import SearchInput from "@/components/SearchInput";

interface BoxShiftOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function BoxShiftOptions({
  search,
  setSearch,
}: BoxShiftOptionsProps) {
  return (
    <div className="flex gap-2">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar turno..."
      />
    </div>
  );
}
