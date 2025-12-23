import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
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
import { useAllSuppliers } from "@/pages/supplier/lib/supplier.hook";
import { useAllWorkers } from "@/pages/worker/lib/worker.hook";
import { useAllVehicles } from "@/pages/vehicle/lib/vehicle.hook";
import { useAllProducts } from "@/pages/product/lib/product.hook";
import PageSkeleton from "@/components/PageSkeleton";
import { useAllGuides } from "@/pages/guide/lib/guide.hook";

export default function ShippingGuideCarrierEditPage() {
  const { ROUTE, MODEL } = SHIPPING_GUIDE_CARRIER;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { guide, fetchGuide, updateGuide, isSubmitting, isFinding } =
    useShippingGuideCarrierStore();

  // Hooks para datos
  const { data: suppliers = [], isLoading: loadingSuppliers } =
    useAllSuppliers();
  const workers = useAllWorkers();
  const { data: vehicles = [], isLoading: loadingVehicles } = useAllVehicles();
  const { data: products = [], isLoading: loadingProducts } = useAllProducts();
  const { data: guides = [] } = useAllGuides();

  // Cargar guía al montar
  useEffect(() => {
    if (id) {
      fetchGuide(parseInt(id));
    }
  }, [id, fetchGuide]);

  const isLoading =
    loadingSuppliers ||
    loadingVehicles ||
    loadingProducts ||
    !workers ||
    !guides ||
    isFinding;

  const onSubmit = async (values: ShippingGuideCarrierFormValues) => {
    if (!id) return;
    try {
      await updateGuide(parseInt(id), values as any);
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      navigate(ROUTE);
    } catch (error: any) {
      errorToast(
        error.response?.data?.message || ERROR_MESSAGE(MODEL, "update")
      );
    }
  };

  if (isLoading || !guide) {
    return <PageSkeleton />;
  }

  // Mapear datos de la guía a initialValues
  const initialValues: ShippingGuideCarrierFormValues = {
    carrier_id: guide.carrier.id.toString(),
    issue_date: guide.issue_date,
    transfer_start_date: guide.transfer_start_date,
    shipping_guide_remittent_id: guide.remittent.id.toString(),
    driver_id: guide.driver.id.toString(),
    vehicle_id: guide.vehicle.id.toString(),
    secondary_vehicle_id: guide.secondary_vehicle?.id.toString() || "",
    driver_license: guide.driver_license,
    origin_address: guide.origin_address,
    origin_ubigeo_id: guide.origin_ubigeo?.id.toString() || "",
    destination_address: guide.destination_address,
    destination_ubigeo_id: guide.destination_ubigeo?.id.toString() || "",
    observations: guide.observations || "",
    details: guide.details.map((d) => ({
      product_id: d.product_id.toString(),
      description: d.description,
      quantity: d.quantity,
      unit: d.unit_measure || "",
      weight: d.weight,
    })),
  };

  return (
    <ShippingGuideCarrierForm
      mode="update"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      initialValues={initialValues}
      carriers={suppliers || []}
      remittents={guides || []}
      drivers={workers || []}
      vehicles={vehicles || []}
      products={products || []}
    />
  );
}
