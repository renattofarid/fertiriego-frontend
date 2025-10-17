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
import SearchInput from "@/components/SearchInput";

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

      <SearchInput onChange={setSearch} value={search} placeholder="Buscar..." />

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
