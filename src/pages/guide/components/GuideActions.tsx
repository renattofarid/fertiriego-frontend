import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GUIDE } from "../lib/guide.interface";
import ActionsWrapper from "@/components/ActionsWrapper";
import ExportButtons from "@/components/ExportButtons";

interface Props {
  excelEndpoint?: string;
}

export default function GuideActions({ excelEndpoint }: Props) {
  const navigate = useNavigate();

  return (
    <ActionsWrapper>
      <ExportButtons
        excelEndpoint={excelEndpoint}
        excelFileName={`guias_${new Date().toISOString().split("T")[0]}.xlsx`}
      />
      <Button  onClick={() => navigate(GUIDE.ROUTE_ADD)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar {GUIDE.MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
