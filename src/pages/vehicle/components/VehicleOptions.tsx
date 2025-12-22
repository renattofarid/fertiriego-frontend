import SearchInput from "@/components/SearchInput";

interface VehicleOptionsProps {
  search: string;
  setSearch: (search: string) => void;
}

export default function VehicleOptions({ search, setSearch }: VehicleOptionsProps) {
  return (
    <div className="flex items-center justify-between">
      <SearchInput
        placeholder="Buscar vehículos..."
        value={search}
        onChange={setSearch}
      />
    </div>
  );
}
