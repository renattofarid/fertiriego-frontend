import SearchInput from "@/components/SearchInput";

interface DebitNoteOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function DebitNoteOptions({
  search,
  setSearch,
}: DebitNoteOptionsProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchInput
        placeholder="Buscar notas de débito..."
        value={search}
        onChange={setSearch}
      />
    </div>
  );
}
