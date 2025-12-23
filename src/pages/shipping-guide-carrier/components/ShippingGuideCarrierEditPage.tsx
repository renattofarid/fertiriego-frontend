import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TitleFormComponent from "@/components/TitleFormComponent";
import FormWrapper from "@/components/FormWrapper";
import FormSkeleton from "@/components/FormSkeleton";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import { SHIPPING_GUIDE_CARRIER } from "../lib/shipping-guide-carrier.interface";
import { Button } from "@/components/ui/button";

export default function ShippingGuideCarrierEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { MODEL, ROUTE, ICON } = SHIPPING_GUIDE_CARRIER;

  const { fetchGuide, guide, isFinding } =
    useShippingGuideCarrierStore();

  useEffect(() => {
    if (!id) {
      navigate(ROUTE);
      return;
    }
    fetchGuide(Number(id));
  }, [id, navigate, fetchGuide]);

  if (isFinding) {
    return (
      <FormWrapper>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
          </div>
        </div>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <TitleFormComponent title={MODEL.name} mode="update" icon={ICON} />
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground mb-4">
          El formulario completo para editar guías de transportista está en desarrollo.
        </p>
        {guide && (
          <div className="mb-4 text-sm">
            <p><strong>Guía:</strong> {guide.full_guide_number}</p>
            <p><strong>Estado:</strong> {guide.status}</p>
          </div>
        )}
        <Button onClick={() => navigate(ROUTE)} variant="outline">
          Volver al listado
        </Button>
      </div>
    </FormWrapper>
  );
}
