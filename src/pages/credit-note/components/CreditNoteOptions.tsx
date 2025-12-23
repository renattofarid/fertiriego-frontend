import SearchInput from "@/components/SearchInput";

interface CreditNoteOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function CreditNoteOptions({
  search,
  setSearch,
}: CreditNoteOptionsProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchInput
        placeholder="Buscar notas de crédito..."
        value={search}
        onChange={setSearch}
      />
    </div>
  );
}
