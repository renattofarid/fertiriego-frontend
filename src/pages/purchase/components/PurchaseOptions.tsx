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

interface PurchaseOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPaymentType: string;
  setSelectedPaymentType: (value: string) => void;
}

export const PurchaseOptions = ({
  search,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentType,
  setSelectedPaymentType,
}: PurchaseOptionsProps) => {
  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("");
    setSelectedPaymentType("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 py-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por correlativo, documento o proveedor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="REGISTRADO">Registrado</SelectItem>
          <SelectItem value="PAGADO">Pagado</SelectItem>
          <SelectItem value="CANCELADO">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Tipo de Pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CONTADO">Contado</SelectItem>
          <SelectItem value="CREDITO">Crédito</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClearFilters}>
        Limpiar Filtros
      </Button>
    </div>
  );
};
