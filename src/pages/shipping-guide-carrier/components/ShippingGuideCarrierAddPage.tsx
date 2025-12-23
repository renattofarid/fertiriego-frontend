import { useNavigate } from "react-router-dom";
import { useShippingGuideCarrierStore } from "../lib/shipping-guide-carrier.store";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
  errorToast,
  successToast,
} from "@/lib/core.function";
import { SHIPPING_GUIDE_CARRIER } from "../lib/shipping-guide-carrier.interface";
import {
  ShippingGuideCarrierForm,
  type ShippingGuideCarrierFormValues,
} from "./ShippingGuideCarrierForm";

export default function ShippingGuideCarrierAddPage() {
  const { ROUTE, MODEL } = SHIPPING_GUIDE_CARRIER;
  const navigate = useNavigate();
  const { createGuide, isSubmitting } = useShippingGuideCarrierStore();

  const onSubmit = async (values: ShippingGuideCarrierFormValues) => {
    try {
      await createGuide(values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"));
    }
  };

  return (
    <ShippingGuideCarrierForm
      mode="create"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
