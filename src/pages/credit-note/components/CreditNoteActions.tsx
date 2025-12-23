import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CreditNoteActions() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate("/notas-credito/agregar")}>
      <Plus className="mr-2 h-4 w-4" />
      Agregar Nota de Crédito
    </Button>
  );
}
