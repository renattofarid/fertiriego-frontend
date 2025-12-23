import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface GuideOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function GuideOptions({ search, setSearch }: GuideOptionsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar guías..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
