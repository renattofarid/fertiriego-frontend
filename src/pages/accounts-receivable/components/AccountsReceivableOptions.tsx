import SearchInput from "@/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountsReceivableOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
}

export default function AccountsReceivableOptions({
  search,
  setSearch,
  currency,
  setCurrency,
}: AccountsReceivableOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Moneda" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="PEN">S/ Soles</SelectItem>
          <SelectItem value="USD">$ Dólares</SelectItem>
        </SelectContent>
      </Select>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar cuenta por cobrar..."
      />
    </div>
  );
}
