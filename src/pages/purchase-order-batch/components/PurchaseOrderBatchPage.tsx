import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleComponent from "@/components/TitleComponent";
import { PURCHASE_ORDER_BATCH } from "../lib/purchase-order-batch.interface";
import SuggestionsStep from "./SuggestionsStep";
import ConfigureOrdersStep from "./ConfigureOrdersStep";
import BatchResultStep from "./BatchResultStep";
import type {
  LotOrderConfig,
  BatchOrderResource,
} from "../lib/purchase-order-batch.interface";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

const { MODEL, ICON } = PURCHASE_ORDER_BATCH;

const STEPS = [
  { label: "Sugerencias" },
  { label: "Configurar Lotes" },
  { label: "Resultado" },
];

export default function PurchaseOrderBatchPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [lotConfigs, setLotConfigs] = useState<LotOrderConfig[]>([]);
  const [batchResult, setBatchResult] = useState<BatchOrderResource[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={MODEL.plural!}
          subtitle={MODEL.description}
          icon={ICON}
        />
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  i < step
                    ? "bg-primary border-primary text-primary-foreground"
                    : i === step
                    ? "border-primary text-primary bg-background"
                    : "border-muted-foreground/30 text-muted-foreground bg-background"
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 mx-3" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 0 && (
        <SuggestionsStep
          onNext={(configs) => {
            setLotConfigs(configs);
            setStep(1);
          }}
        />
      )}

      {step === 1 && (
        <ConfigureOrdersStep
          lotConfigs={lotConfigs}
          onBack={() => setStep(0)}
          onNext={(result) => {
            setBatchResult(result);
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <BatchResultStep
          orders={batchResult}
          onGoToOrders={() => navigate("/ordenes-compra")}
          onNewBatch={() => {
            setLotConfigs([]);
            setBatchResult([]);
            setStep(0);
          }}
        />
      )}
    </div>
  );
}
