import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ExportButtons from "@/components/ExportButtons";
import { Plus } from "lucide-react";

interface CreditNoteActionsProps {
  search?: string;
  issueDate?: string[];
  creditNoteMotiveId?: string;
  status?: string;
  customerId?: string;
  saleId?: string;
  affectsStock?: string;
  createdAt?: string[];
}

export default function CreditNoteActions({
  search,
  issueDate,
  creditNoteMotiveId,
  status,
  customerId,
  saleId,
  affectsStock,
  createdAt,
}: CreditNoteActionsProps) {
  const navigate = useNavigate();

  const excelParams = new URLSearchParams();
  if (search) excelParams.append("full_document_number", search);
  issueDate?.forEach((date) => excelParams.append("issue_date[]", date));
  if (creditNoteMotiveId) {
    excelParams.append("credit_note_motive_id", creditNoteMotiveId);
  }
  if (status) excelParams.append("status", status);
  if (customerId) excelParams.append("customer_id", customerId);
  if (saleId) excelParams.append("sale_id", saleId);
  if (affectsStock) excelParams.append("affects_stock", affectsStock);
  createdAt?.forEach((date) => excelParams.append("created_at[]", date));

  const excelQuery = excelParams.toString();
  const excelEndpoint = `/credit-notes/export${excelQuery ? `?${excelQuery}` : ""}`;

  return (
    <div className="flex items-center gap-2">
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName="notas-credito.xlsx"
        variant="grouped"
      />

      <Button onClick={() => navigate("/notas-credito/agregar")}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Nota de Crédito
      </Button>
    </div>
  );
}
