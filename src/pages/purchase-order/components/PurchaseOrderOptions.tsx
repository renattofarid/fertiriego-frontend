import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
}

export default function PurchaseOrderOptions({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 py-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por correlativo, número de orden o proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Pendiente">Pendiente</SelectItem>
          <SelectItem value="Completada">Completada</SelectItem>
          <SelectItem value="Cancelada">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClearFilters}>
        Limpiar Filtros
      </Button>
    </div>
  );
}
