import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  saleSchemaCreate,
  saleSchemaUpdate,
  type SaleSchema,
} from "../lib/sale.schema";
import {
  Plus,
  Trash2,
  Pencil,
  FileText,
  CreditCard,
  ListCheck,
  ListChecks,
} from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormSwitch } from "@/components/FormSwitch";
import { DatePickerFormField } from "@/components/DatePickerFormField";
import type { SaleResource } from "../lib/sale.interface";
import type { WarehouseResource } from "@/pages/warehouse/lib/warehouse.interface";
import type { PersonResource } from "@/pages/person/lib/person.interface";
import { useState, useEffect, useRef } from "react";
import { useWarehouseProducts } from "@/pages/warehouse-product/lib/warehouse-product.hook";
import type { WarehouseProductResource } from "@/pages/warehouse-product/lib/warehouse-product.interface";
import { useAllGuides } from "@/pages/guide/lib/guide.hook";
import { useAllShippingGuideCarriers } from "@/pages/shipping-guide-carrier/lib/shipping-guide-carrier.hook";
import { useAllProductPriceCategories } from "@/pages/product-price-category/lib/product-price-category.hook";
import { useProductPrices } from "@/pages/product/lib/product-price.hook";
import { ClientCreateModal } from "@/pages/client/components/ClientCreateModal";
import { WarehouseCreateModal } from "@/pages/warehouse/components/WarehouseCreateModal";
import { formatDecimalTrunc } from "@/lib/utils";
import { formatNumber } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DOCUMENT_TYPES,
  PAYMENT_TYPES,
  CURRENCIES,
} from "../lib/sale.interface";
import { errorToast } from "@/lib/core.function";
import { GroupFormSection } from "@/components/GroupFormSection";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SaleSummary } from "./SaleSummary";
import { FormSelectAsync } from "@/components/FormSelectAsync";
import { useClients } from "@/pages/client/lib/client.hook";
import { FormInput } from "@/components/FormInput";

interface SaleFormProps {
  defaultValues: Partial<SaleSchema>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
  warehouses: WarehouseResource[];
  sourceData?: any; // QuotationResourceById | OrderResourceById | GuideResourceById
  sourceType?: "quotation" | "order" | "guide" | null;
  sale?: SaleResource;
}

interface DetailRow {
  product_id: string;
  product_name?: string;
  quantity: string;
  unit_price: string;
  subtotal: number;
  igv: number;
  total: number;
}

interface InstallmentRow {
  due_days: string;
  amount: string;
}

interface GuideRow {
  name: string;
  correlative: string;
}

export const SaleForm = ({
  onCancel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  warehouses,
  sourceData,
  sourceType,
}: SaleFormProps) => {
  // Estados para detalles
  const [details, setDetails] = useState<DetailRow[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<
    PersonResource | undefined
  >(undefined);

  // Watch para el almacén seleccionado
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");

  // Estado para el modal de crear cliente
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Estado para el modal de crear almacén
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehousesList, setWarehousesList] =
    useState<WarehouseResource[]>(warehouses);

  // Obtener guías de remisión
  const { data: guidesRemision, isLoading: isLoadingGuidesRemision } =
    useAllGuides();

  // Obtener guías de transportista
  const { data: guidesCarrier, isLoading: isLoadingGuidesCarrier } =
    useAllShippingGuideCarriers();

  // Cargar categorías de precio
  const { data: priceCategories } = useAllProductPriceCategories();

  const [productSelected, setProductSelected] =
    useState<WarehouseProductResource | null>(null);

  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<DetailRow>({
    product_id: "",
    quantity: "",
    unit_price: "",
    subtotal: 0,
    igv: 0,
    total: 0,
  });

  // Estado para controlar el precio automático
  const [lastSetPrice, setLastSetPrice] = useState<string | null>(null);

  // Estados para cuotas
  const [installments, setInstallments] = useState<InstallmentRow[]>([]);
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState<
    number | null
  >(null);
  const [currentInstallment, setCurrentInstallment] = useState<InstallmentRow>({
    due_days: "",
    amount: "",
  });

  // Estados para guías
  const [guides, setGuides] = useState<GuideRow[]>([]);
  const [editingGuideIndex, setEditingGuideIndex] = useState<number | null>(
    null,
  );
  const [currentGuide, setCurrentGuide] = useState<GuideRow>({
    name: "",
    correlative: "",
  });

  // Estado para controlar la sincronización bidireccional de precios
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // Ref para evitar auto-generación en el montaje inicial
  const isInitialMount = useRef(true);

  // Formatea un número a 4 decimales sin ceros innecesarios
  const formatNumberLocal = (num: number): string =>
    parseFloat(num.toFixed(4)).toString();

  // Formularios temporales
  const detailTempForm = useForm({
    defaultValues: {
      temp_product_id: currentDetail.product_id,
      temp_price_category_id: "",
      temp_quantity: currentDetail.quantity,
      temp_unit_price: currentDetail.unit_price,
      temp_value_price: "",
    },
  });

  const installmentTempForm = useForm({
    defaultValues: {
      temp_due_days: currentInstallment.due_days,
      temp_amount: currentInstallment.amount,
    },
  });

  const guideTempForm = useForm({
    defaultValues: {
      temp_guide_type: "",
      temp_guide_id: "",
      temp_guide_name: currentGuide.name,
      temp_guide_correlative: currentGuide.correlative,
    },
  });

  // Watchers para detalles
  const selectedProductId = detailTempForm.watch("temp_product_id");
  const selectedPriceCategoryId = detailTempForm.watch(
    "temp_price_category_id",
  );
  const selectedQuantity = detailTempForm.watch("temp_quantity");
  const selectedUnitPrice = detailTempForm.watch("temp_unit_price");
  const selectedValuePrice = detailTempForm.watch("temp_value_price");

  // Cargar precios del producto seleccionado
  const { data: productPricesData } = useProductPrices({
    productId: parseInt(selectedProductId) || 0,
  });

  // Watchers para cuotas
  const selectedDueDays = installmentTempForm.watch("temp_due_days");
  const selectedAmount = installmentTempForm.watch("temp_amount");

  // Watchers para guías
  const selectedGuideType = guideTempForm.watch("temp_guide_type");
  const selectedGuideId = guideTempForm.watch("temp_guide_id");
  const selectedGuideName = guideTempForm.watch("temp_guide_name");
  const selectedGuideCorrelative = guideTempForm.watch(
    "temp_guide_correlative",
  );

  // Actualizar lista de almacenes cuando cambie la prop
  useEffect(() => {
    setWarehousesList(warehouses);
  }, [warehouses]);

  // Función para manejar la creación de un nuevo cliente
  const handleClientCreated = (newClient: PersonResource) => {
    // Seleccionar automáticamente el nuevo cliente
    form.setValue("customer_id", newClient.id.toString(), {
      shouldValidate: true,
    });
  };

  // Función para manejar la creación de un nuevo almacén
  const handleWarehouseCreated = (newWarehouse: WarehouseResource) => {
    // Agregar el nuevo almacén a la lista
    setWarehousesList((prev) => [...prev, newWarehouse]);
    // Seleccionar automáticamente el nuevo almacén
    form.setValue("warehouse_id", newWarehouse.id.toString(), {
      shouldValidate: true,
    });
  };

  // Observers para detalles
  useEffect(() => {
    if (selectedProductId !== currentDetail.product_id) {
      setCurrentDetail((prev) => ({
        ...prev,
        product_id: selectedProductId || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

  useEffect(() => {
    if (selectedQuantity !== currentDetail.quantity) {
      setCurrentDetail((prev) => ({
        ...prev,
        quantity: selectedQuantity || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuantity]);

  useEffect(() => {
    if (selectedUnitPrice !== currentDetail.unit_price) {
      setCurrentDetail((prev) => ({
        ...prev,
        unit_price: selectedUnitPrice || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitPrice]);

  // Sincronización bidireccional: temp_unit_price → temp_value_price
  useEffect(() => {
    if (isUpdatingPrice) return;
    const price = parseFloat(selectedUnitPrice);
    if (!isNaN(price) && price > 0) {
      setIsUpdatingPrice(true);
      detailTempForm.setValue(
        "temp_value_price",
        formatNumberLocal(price / 1.18),
      );
      setIsUpdatingPrice(false);
    } else if (selectedUnitPrice === "") {
      detailTempForm.setValue("temp_value_price", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitPrice]);

  // Sincronización bidireccional: temp_value_price → temp_unit_price
  useEffect(() => {
    if (isUpdatingPrice) return;
    const value = parseFloat(selectedValuePrice);
    if (!isNaN(value) && value > 0) {
      setIsUpdatingPrice(true);
      detailTempForm.setValue(
        "temp_unit_price",
        formatNumberLocal(value * 1.18),
      );
      setIsUpdatingPrice(false);
    } else if (selectedValuePrice === "") {
      detailTempForm.setValue("temp_unit_price", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValuePrice]);

  // Observers para cuotas
  useEffect(() => {
    if (selectedDueDays !== currentInstallment.due_days) {
      setCurrentInstallment((prev) => ({
        ...prev,
        due_days: selectedDueDays || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDueDays]);

  useEffect(() => {
    if (selectedAmount !== currentInstallment.amount) {
      setCurrentInstallment((prev) => ({
        ...prev,
        amount: selectedAmount || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAmount]);

  // Observers para guías - Cuando se selecciona una guía específica
  useEffect(() => {
    if (selectedGuideType && selectedGuideId) {
      let guideName = "";
      let guideCorrelative = "";

      if (selectedGuideType === "remision" && guidesRemision) {
        const guide = guidesRemision.find(
          (g) => g.id.toString() === selectedGuideId,
        );
        if (guide) {
          guideName = "Guía de Remisión";
          guideCorrelative = guide.full_guide_number;
        }
      } else if (selectedGuideType === "transportista" && guidesCarrier) {
        const guide = guidesCarrier.find(
          (g) => g.id.toString() === selectedGuideId,
        );
        if (guide) {
          guideName = "Guía de Transportista";
          guideCorrelative = guide.full_guide_number;
        }
      }

      if (guideName && guideCorrelative) {
        setCurrentGuide({
          name: guideName,
          correlative: guideCorrelative,
        });
        guideTempForm.setValue("temp_guide_name", guideName);
        guideTempForm.setValue("temp_guide_correlative", guideCorrelative);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuideType, selectedGuideId]);

  useEffect(() => {
    if (selectedGuideName !== currentGuide.name) {
      setCurrentGuide((prev) => ({
        ...prev,
        name: selectedGuideName || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuideName]);

  useEffect(() => {
    if (selectedGuideCorrelative !== currentGuide.correlative) {
      setCurrentGuide((prev) => ({
        ...prev,
        correlative: selectedGuideCorrelative || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuideCorrelative]);

  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? saleSchemaCreate : saleSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      details: details.length > 0 ? details : [],
      installments: installments.length > 0 ? installments : [],
      guides: guides.length > 0 ? guides : [],
      is_anticipado: defaultValues.is_anticipado || false,
      is_deduccion: defaultValues.is_deduccion || false,
      is_retencionigv: defaultValues.is_retencionigv || false,
      is_termine_condition: defaultValues.is_termine_condition || false,
    },
    mode: "onChange",
  });

  // Inicializar detalles y cuotas desde defaultValues (para modo edición)
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      // Inicializar detalles
      if (defaultValues.details && defaultValues.details.length > 0) {
        const initialDetails = defaultValues.details.map((detail: any) => {
          const quantity = parseFloat(detail.quantity);
          const unitPrice = parseFloat(detail.unit_price); // precio con IGV
          const subtotal = roundTo6Decimals(quantity * (unitPrice / 1.18));
          const igv = roundTo6Decimals(subtotal * 0.18);
          const total = roundTo6Decimals(subtotal + igv);

          return {
            product_id: detail.product_id,
            product_name: detail.product_name || detail.product?.name,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            subtotal,
            igv,
            total,
          };
        });
        setDetails(initialDetails);
        form.setValue("details", initialDetails);
      }

      // Inicializar cuotas
      if (defaultValues.installments && defaultValues.installments.length > 0) {
        const initialInstallments = defaultValues.installments.map(
          (inst: any) => ({
            due_days: inst.due_days,
            amount: inst.amount,
          }),
        );
        setInstallments(initialInstallments);
        form.setValue("installments", initialInstallments);
      }

      // Disparar validación después de setear valores en modo edición
      form.trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch para el tipo de pago
  const selectedPaymentType = form.watch("payment_type");

  // Watch para el almacén seleccionado
  const watchedWarehouseId = form.watch("warehouse_id");

  // Actualizar el warehouse_id cuando cambie
  useEffect(() => {
    if (watchedWarehouseId && watchedWarehouseId !== selectedWarehouseId) {
      setSelectedWarehouseId(watchedWarehouseId);
    }
  }, [watchedWarehouseId, selectedWarehouseId]);

  // Watch para la moneda seleccionada
  const selectedCurrency = form.watch("currency");

  // Watch para retención IGV
  const isRetencionIGV = form.watch("is_retencionigv");

  // Autocompletar precio cuando se selecciona categoría de precio o moneda
  useEffect(() => {
    if (selectedPriceCategoryId && productPricesData && selectedCurrency) {
      const selectedPrice = productPricesData.find(
        (price) => price.category_id === parseInt(selectedPriceCategoryId),
      );

      if (selectedPrice) {
        let priceValue: number = 0;

        // Seleccionar el precio según la moneda (usar 0 si no existe)
        if (selectedPrice.prices) {
          priceValue = selectedPrice.prices[selectedCurrency] ?? 0;
        }

        if (priceValue.toString() !== lastSetPrice) {
          setIsUpdatingPrice(true);
          detailTempForm.setValue("temp_unit_price", priceValue.toString());
          detailTempForm.setValue(
            "temp_value_price",
            formatNumberLocal(priceValue / 1.18),
          );
          setIsUpdatingPrice(false);
          setLastSetPrice(priceValue.toString());
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPriceCategoryId, selectedCurrency, productPricesData]);

  // Reset lastSetPrice cuando cambia el producto
  useEffect(() => {
    setLastSetPrice(null);
    detailTempForm.setValue("temp_price_category_id", "");
  }, [selectedProductId, detailTempForm]);

  // Auto-completar datos desde sourceData (orden, cotización o guía)
  useEffect(() => {
    if (sourceData && sourceType && mode === "create") {
      if (sourceType === "quotation" || sourceType === "order") {
        // Auto-completar campos comunes
        form.setValue("customer_id", sourceData.customer_id.toString());
        form.setValue("warehouse_id", sourceData.warehouse_id.toString());
        form.setValue("currency", sourceData.currency);
        form.setValue("observations", sourceData.observations || "");

        if (sourceType === "quotation") {
          form.setValue("payment_type", sourceData.payment_type);

          // Auto-completar detalles desde cotización
          const quotationDetails: DetailRow[] =
            sourceData.quotation_details.map((detail: any) => {
              const quantity = parseFloat(detail.quantity);
              const unitPrice = parseFloat(detail.unit_price); // precio con IGV
              const subtotal = roundTo6Decimals(quantity * (unitPrice / 1.18));
              const igv = roundTo6Decimals(subtotal * 0.18);
              const total = roundTo6Decimals(subtotal + igv);

              return {
                product_id: detail.product_id.toString(),
                product_name: detail.product?.name,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
                subtotal,
                igv,
                total,
              };
            });

          setDetails(quotationDetails);
          form.setValue("details", quotationDetails);
        } else if (sourceType === "order") {
          // Auto-completar detalles desde orden
          const orderDetails: DetailRow[] = sourceData.order_details.map(
            (detail: any) => {
              const quantity = parseFloat(detail.quantity);
              const unitPrice = parseFloat(detail.unit_price); // precio con IGV
              const subtotal = roundTo6Decimals(quantity * (unitPrice / 1.18));
              const igv = roundTo6Decimals(subtotal * 0.18);
              const total = roundTo6Decimals(subtotal + igv);

              return {
                product_id: detail.product_id.toString(),
                product_name: detail.product?.name,
                quantity: detail.quantity,
                unit_price: detail.unit_price,
                subtotal,
                igv,
                total,
              };
            },
          );

          setDetails(orderDetails);
          form.setValue("details", orderDetails);
        }
      } else if (sourceType === "guide") {
        // Auto-completar desde guía de remisión
        // El cliente viene de la venta asociada a la guía
        if (sourceData.recipient?.id) {
          form.setValue("customer_id", sourceData.recipient.id.toString());
        }

        // El almacén viene de la guía
        if (sourceData.warehouse?.id) {
          form.setValue("warehouse_id", sourceData.warehouse.id.toString());
        }

        // Prellenar moneda y observaciones si existen
        form.setValue("currency", sourceData.sale?.currency || "PEN");
        form.setValue("observations", sourceData.observations || "");

        // Auto-completar detalles desde guía
        if (sourceData.details && sourceData.details.length > 0) {
          // Crear un mapa de precios desde el documento origen (purchase, sale, order, warehouse_document)
          const priceMap = new Map<number, number>();

          // Si la guía viene de una venta, usar los precios de la venta
          if (sourceData.sale?.details) {
            sourceData.sale.details.forEach((detail: any) => {
              priceMap.set(
                detail.product_id,
                parseFloat(detail.unit_price || "0"),
              );
            });
          }

          // Si la guía viene de una compra, usar los precios de la compra
          if (sourceData.purchase?.details) {
            sourceData.purchase.details.forEach((detail: any) => {
              priceMap.set(
                detail.product_id,
                parseFloat(detail.unit_price || "0"),
              );
            });
          }

          const guideDetails: DetailRow[] = sourceData.details.map(
            (detail: any) => {
              const quantity = parseFloat(detail.quantity);
              // Intentar obtener el precio del documento origen, sino se deja en 0
              const unitPrice = priceMap.get(detail.product_id) || 0; // precio con IGV
              const subtotal = roundTo6Decimals(quantity * (unitPrice / 1.18));
              const igv = roundTo6Decimals(subtotal * 0.18);
              const total = roundTo6Decimals(subtotal + igv);

              return {
                product_id: detail.product_id.toString(),
                product_name: detail.product_name,
                quantity: detail.quantity,
                unit_price: unitPrice.toString(),
                subtotal,
                igv,
                total,
              };
            },
          );

          setDetails(guideDetails);
          form.setValue("details", guideDetails);
        }

        // Agregar automáticamente la guía al apartado de guías
        if (sourceData.full_guide_number) {
          const guideRow: GuideRow = {
            name: "Guía de Remisión",
            correlative: sourceData.full_guide_number,
          };
          setGuides([guideRow]);
          form.setValue("guides", [guideRow]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceData, sourceType]);

  // Establecer fecha de emisión automáticamente al cargar el formulario
  useEffect(() => {
    // Inicializar montos de pago a 0
    if (!form.getValues("amount_cash")) {
      form.setValue("amount_cash", "0");
    }
    if (!form.getValues("amount_card")) {
      form.setValue("amount_card", "0");
    }
    if (!form.getValues("amount_yape")) {
      form.setValue("amount_yape", "0");
    }
  }, [form]);

  // Función de redondeo a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

  // Funciones para detalles
  const handleAddDetail = () => {
    if (
      !currentDetail.product_id ||
      !currentDetail.quantity ||
      !currentDetail.unit_price
    ) {
      return;
    }

    const quantity = parseFloat(currentDetail.quantity);
    const unitPrice = parseFloat(currentDetail.unit_price); // precio con IGV

    // Calcular subtotal, IGV (18%) y total con redondeo a 6 decimales
    // unit_price es el precio CON IGV, por lo que el valor sin IGV es unit_price / 1.18
    const subtotal = roundTo6Decimals(quantity * (unitPrice / 1.18));
    const igv = roundTo6Decimals(subtotal * 0.18); // IGV 18%
    const total = roundTo6Decimals(subtotal + igv);

    const newDetail: DetailRow = {
      ...currentDetail,
      product_name: productSelected?.product_name,
      subtotal,
      igv,
      total,
    };

    if (editingDetailIndex !== null) {
      const updatedDetails = [...details];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
      setEditingDetailIndex(null);
    } else {
      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);
      form.setValue("details", updatedDetails);
    }

    // Limpiar formulario y estado
    const emptyDetail = {
      product_id: "",
      quantity: "",
      unit_price: "",
      subtotal: 0,
      igv: 0,
      total: 0,
    };
    setCurrentDetail(emptyDetail);
    setLastSetPrice(null);
    detailTempForm.reset({
      temp_product_id: "",
      temp_price_category_id: "",
      temp_quantity: "",
      temp_unit_price: "",
      temp_value_price: "",
    });
  };

  const handleEditDetail = (index: number) => {
    const detail = details[index];
    setCurrentDetail(detail);
    setIsUpdatingPrice(true);
    detailTempForm.setValue("temp_product_id", detail.product_id);
    detailTempForm.setValue("temp_quantity", detail.quantity);
    detailTempForm.setValue("temp_unit_price", detail.unit_price);
    detailTempForm.setValue(
      "temp_value_price",
      detail.unit_price
        ? formatNumberLocal(parseFloat(detail.unit_price) / 1.18)
        : "",
    );
    setIsUpdatingPrice(false);
    setEditingDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    const updatedDetails = details.filter((_, i) => i !== index);
    setDetails(updatedDetails);
    form.setValue("details", updatedDetails);
  };

  const calculateDetailsSubtotal = () => {
    const sum = details.reduce(
      (sum, detail) => sum + (detail.subtotal || 0),
      0,
    );
    return roundTo6Decimals(sum);
  };

  const calculateDetailsIGV = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.igv || 0), 0);
    return roundTo6Decimals(sum);
  };

  const calculateDetailsTotal = () => {
    const sum = details.reduce((sum, detail) => sum + (detail.total || 0), 0);
    return roundTo6Decimals(sum);
  };

  const calculateRetencion = () => {
    if (!isRetencionIGV) return 0;
    return roundTo6Decimals(calculateDetailsTotal() * 0.03);
  };

  const calculateNetTotal = () => {
    return roundTo6Decimals(calculateDetailsTotal() - calculateRetencion());
  };

  // Auto-generar cuota cuando se habilita retención IGV con pago a crédito
  useEffect(() => {
    if (
      isRetencionIGV &&
      selectedPaymentType === "CREDITO" &&
      details.length > 0
    ) {
      const netTotal = calculateNetTotal();
      const autoInstallment: InstallmentRow = {
        due_days: "0",
        amount: netTotal.toFixed(6),
      };
      setInstallments([autoInstallment]);
      form.setValue("installments", [autoInstallment]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRetencionIGV, selectedPaymentType]);

  // Auto-generar cuota de 30 días al cambiar a tipo de pago crédito
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (selectedPaymentType === "CREDITO") {
      const netTotal = calculateNetTotal();
      const autoInstallment: InstallmentRow = {
        due_days: "30",
        amount: netTotal.toFixed(6),
      };
      setInstallments([autoInstallment]);
      form.setValue("installments", [autoInstallment]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaymentType]);

  // Funciones para cuotas
  const handleAddInstallment = () => {
    if (!currentInstallment.due_days || !currentInstallment.amount) {
      return;
    }

    const newAmount = parseFloat(currentInstallment.amount);
    const saleTotal = calculateNetTotal();

    // Calcular el total de cuotas (excluyendo la que se está editando si aplica)
    let currentInstallmentsTotal = installments.reduce((sum, inst, idx) => {
      if (editingInstallmentIndex !== null && idx === editingInstallmentIndex) {
        return sum;
      }
      return sum + parseFloat(inst.amount);
    }, 0);

    // Validar que no exceda el total de la venta
    if (currentInstallmentsTotal + newAmount > saleTotal) {
      errorToast(
        `El total de cuotas no puede exceder el total de la venta (${formatDecimalTrunc(
          saleTotal,
          6,
        )})`,
      );
      return;
    }

    const newInstallment: InstallmentRow = { ...currentInstallment };

    if (editingInstallmentIndex !== null) {
      const updatedInstallments = [...installments];
      updatedInstallments[editingInstallmentIndex] = newInstallment;
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
      setEditingInstallmentIndex(null);
    } else {
      const updatedInstallments = [...installments, newInstallment];
      setInstallments(updatedInstallments);
      form.setValue("installments", updatedInstallments);
    }

    setCurrentInstallment({
      due_days: "",
      amount: "",
    });
    installmentTempForm.setValue("temp_due_days", "");
    installmentTempForm.setValue("temp_amount", "");
  };

  const handleEditInstallment = (index: number) => {
    const inst = installments[index];
    setCurrentInstallment(inst);
    installmentTempForm.setValue("temp_due_days", inst.due_days);
    installmentTempForm.setValue("temp_amount", inst.amount);
    setEditingInstallmentIndex(index);
  };

  const handleRemoveInstallment = (index: number) => {
    const updatedInstallments = installments.filter((_, i) => i !== index);
    setInstallments(updatedInstallments);
    form.setValue("installments", updatedInstallments);
  };

  const calculateInstallmentsTotal = () => {
    const sum = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.amount),
      0,
    );
    return roundTo6Decimals(sum);
  };

  const installmentsMatchTotal = () => {
    if (installments.length === 0) return true;
    const saleTotal = calculateNetTotal();
    const installmentsTotal = calculateInstallmentsTotal();
    // Comparar con tolerancia de 2 decimales (0.01) en lugar de 6 decimales
    return Math.abs(saleTotal - installmentsTotal) < 0.01;
  };

  // Funciones para guías
  const handleAddGuide = () => {
    if (!currentGuide.name || !currentGuide.correlative) {
      return;
    }

    const newGuide: GuideRow = { ...currentGuide };

    if (editingGuideIndex !== null) {
      const updatedGuides = [...guides];
      updatedGuides[editingGuideIndex] = newGuide;
      setGuides(updatedGuides);
      form.setValue("guides", updatedGuides);
      setEditingGuideIndex(null);
    } else {
      const updatedGuides = [...guides, newGuide];
      setGuides(updatedGuides);
      form.setValue("guides", updatedGuides);
    }

    setCurrentGuide({
      name: "",
      correlative: "",
    });
    guideTempForm.setValue("temp_guide_type", "");
    guideTempForm.setValue("temp_guide_id", "");
    guideTempForm.setValue("temp_guide_name", "");
    guideTempForm.setValue("temp_guide_correlative", "");
  };

  const handleEditGuide = (index: number) => {
    const guide = guides[index];
    setCurrentGuide(guide);
    guideTempForm.setValue("temp_guide_name", guide.name);
    guideTempForm.setValue("temp_guide_correlative", guide.correlative);
    setEditingGuideIndex(index);
  };

  const handleRemoveGuide = (index: number) => {
    const updatedGuides = guides.filter((_, i) => i !== index);
    setGuides(updatedGuides);
    form.setValue("guides", updatedGuides);
  };

  // Funciones para montos de pago
  const calculatePaymentTotal = () => {
    const cash = parseFloat(form.watch("amount_cash") || "0");
    const card = parseFloat(form.watch("amount_card") || "0");
    const yape = parseFloat(form.watch("amount_yape") || "0");
    const sum = cash + card + yape;
    return roundTo6Decimals(sum);
  };

  const paymentAmountsMatchTotal = () => {
    if (selectedPaymentType !== "CONTADO") return true;
    const saleTotal = calculateNetTotal();
    const paymentTotal = calculatePaymentTotal();
    // Comparar con tolerancia de 2 decimales (0.01) en lugar de 6 decimales
    return Math.abs(saleTotal - paymentTotal) < 0.01;
  };

  const handleFormSubmit = (data: any) => {
    // Validar que si es al contado, los montos de pago deben coincidir con el total
    if (selectedPaymentType === "CONTADO" && !paymentAmountsMatchTotal()) {
      errorToast(
        `El total pagado (${formatNumber(
          calculatePaymentTotal(),
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateNetTotal(),
        )})`,
      );
      return;
    }

    // Validar que si es a crédito, debe tener cuotas
    if (selectedPaymentType === "CREDITO" && installments.length === 0) {
      errorToast("Para pagos a crédito, debe agregar al menos una cuota");
      return;
    }

    // Validar que las cuotas coincidan con el total si hay cuotas
    if (installments.length > 0 && !installmentsMatchTotal()) {
      errorToast(
        `El total de cuotas (${formatNumber(
          calculateInstallmentsTotal(),
        )}) debe ser igual al total de la venta (${formatNumber(
          calculateNetTotal(),
        )})`,
      );
      return;
    }

    // Preparar cuotas según el tipo de pago
    let validInstallments: {
      due_days: string;
      amount: string;
    }[];

    if (selectedPaymentType === "CONTADO") {
      // Para pagos al contado, las cuotas van vacías
      validInstallments = [];
    } else {
      // Para pagos a crédito, usar las cuotas ingresadas
      validInstallments = installments
        .filter((inst) => inst.due_days && inst.amount)
        .map((inst) => ({
          due_days: inst.due_days,
          amount: inst.amount,
        }));
    }

    onSubmit({
      ...data,
      details,
      installments: validInstallments,
      guides: guides.length > 0 ? guides : undefined,
      order_id: data.order_id ? parseInt(data.order_id) : undefined,
      quotation_id: data.quotation_id ? parseInt(data.quotation_id) : undefined,
      guide_id: data.guide_id ? parseInt(data.guide_id) : undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="grid xl:grid-cols-3 gap-6 w-full"
      >
        <div className="xl:col-span-2 space-y-6">
          {/* Información General */}
          <GroupFormSection
            title="Información General"
            icon={FileText}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex gap-2 items-end col-span-1 md:col-span-2">
                <div className="truncate! flex-1">
                  <FormSelectAsync
                    control={form.control}
                    name="customer_id"
                    label="Cliente"
                    placeholder="Seleccione un cliente"
                    useQueryHook={useClients}
                    additionalParams={{
                      per_page: 100,
                    }}
                    mapOptionFn={(customer: PersonResource) => ({
                      value: customer.id.toString(),
                      label:
                        customer.business_name ??
                        `${customer.names} ${customer.father_surname} ${customer.mother_surname}`,
                      description: customer.number_document,
                    })}
                    disabled={mode === "edit"}
                    onValueChange={(_value, item) => {
                      setSelectedCustomer(item ?? null);
                    }}
                    preloadItemId={
                      mode === "edit" ||
                      (sourceData &&
                        (sourceType === "guide" ||
                          sourceType === "order" ||
                          sourceType === "quotation"))
                        ? form.getValues("customer_id")
                        : undefined
                    }
                  />
                </div>
                {mode === "create" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsClientModalOpen(true)}
                    className="flex-shrink-0"
                    title="Crear nuevo cliente"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormSelect
                control={form.control}
                name="document_type"
                label="Tipo de Documento"
                placeholder="Seleccione tipo"
                options={DOCUMENT_TYPES.map((dt) => ({
                  value: dt.value,
                  label: dt.label,
                }))}
              />

              <div className="flex gap-2 items-end">
                <div className="truncate! flex-1">
                  <FormSelect
                    control={form.control}
                    name="warehouse_id"
                    label="Almacén"
                    placeholder="Seleccione un almacén"
                    options={warehousesList.map((warehouse) => ({
                      value: warehouse.id.toString(),
                      label: warehouse.name,
                    }))}
                    disabled={mode === "edit"}
                  />
                </div>
                {mode === "create" && (
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setIsWarehouseModalOpen(true)}
                    className="flex-shrink-0"
                    title="Crear nuevo almacén"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <DatePickerFormField
                control={form.control}
                name="issue_date"
                label="Fecha de Emisión"
                placeholder="Seleccione fecha"
                dateFormat="dd/MM/yyyy"
                disabledRange={{
                  after: new Date(),
                }}
              />

              <FormSelect
                control={form.control}
                name="payment_type"
                label="Tipo de Pago"
                placeholder="Seleccione tipo"
                options={PAYMENT_TYPES.map((pt) => ({
                  value: pt.value,
                  label: pt.label,
                }))}
              />

              <FormSelect
                control={form.control}
                name="currency"
                label="Moneda"
                placeholder="Seleccione moneda"
                options={CURRENCIES.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
              />

              <FormInput
                control={form.control}
                name="order_purchase"
                label="Orden de Compra"
                placeholder="Ingrese número de orden"
              />

              <FormSwitch
                control={form.control}
                name="is_anticipado"
                label="Anticipo"
                text="Marque si es una venta anticipada"
              />

              <FormSwitch
                control={form.control}
                name="is_deduccion"
                label="Deducción"
                text="Marque si aplica deducción"
              />

              <FormSwitch
                control={form.control}
                name="is_retencionigv"
                label="Retención IGV"
                text="Marque si aplica retención de IGV"
              />

              <FormSwitch
                control={form.control}
                name="is_termine_condition"
                label="Condición de Término"
                text="Marque si tiene condición de término"
              />

              <div className="md:col-span-2 lg:col-span-3">
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ingrese observaciones adicionales"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </GroupFormSection>
          {/* Detalles */}
          <GroupFormSection
            title="Detalles de la Venta"
            icon={ListCheck}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-muted rounded-lg">
              <div className="md:col-span-2">
                <Form {...detailTempForm}>
                  <FormSelectAsync
                    control={detailTempForm.control}
                    name="temp_product_id"
                    label="Producto"
                    placeholder="Seleccione"
                    useQueryHook={useWarehouseProducts}
                    mapOptionFn={(wp: WarehouseProductResource) => ({
                      value: wp.product_id.toString(),
                      label: wp.product_name,
                      description: `Stock: ${wp.stock}`,
                    })}
                    additionalParams={{
                      warehouse_id: selectedWarehouseId,
                    }}
                    onValueChange={(_value, item) => {
                      setProductSelected(item ?? null);
                    }}
                    disabled={!selectedWarehouseId}
                  />
                </Form>
              </div>

              {selectedProductId &&
                priceCategories &&
                priceCategories.length > 0 && (
                  <div className="md:col-span-2">
                    <Form {...detailTempForm}>
                      <FormSelect
                        control={detailTempForm.control}
                        name="temp_price_category_id"
                        label="Categoría de Precio"
                        placeholder="Seleccionar (opcional)"
                        options={priceCategories.map((cat) => ({
                          value: cat.id.toString(),
                          label: cat.name,
                        }))}
                      />
                    </Form>
                  </div>
                )}

              <FormInput
                control={detailTempForm.control}
                name="temp_quantity"
                label="Cantidad"
                placeholder="0"
                type="number"
                min={0}
              />

              <FormInput
                control={detailTempForm.control}
                name="temp_value_price"
                label="Valor Unit. (sin IGV)"
                placeholder="0.0000"
                type="number"
                min={0}
                step="0.0001"
              />

              <FormInput
                control={detailTempForm.control}
                name="temp_unit_price"
                label="Precio Unit. (con IGV)"
                placeholder="0.0000"
                type="number"
                min={0}
                step="0.0001"
              />

              <div className="md:col-span-4 flex items-center justify-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleAddDetail}
                  disabled={
                    !currentDetail.product_id ||
                    !currentDetail.quantity ||
                    !currentDetail.unit_price
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingDetailIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </div>

            {details.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">V. Unit.</TableHead>
                      <TableHead className="text-right">P. Unit.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">IGV (18%)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.product_name}</TableCell>
                        <TableCell className="text-right">
                          {detail.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(parseFloat(detail.unit_price) / 1.18)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(parseFloat(detail.unit_price))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(detail.subtotal)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatNumber(detail.igv)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatNumber(detail.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleEditDetail(index)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveDetail(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        TOTALES
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatNumber(calculateDetailsSubtotal())}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {formatNumber(calculateDetailsIGV())}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-primary">
                        {formatNumber(calculateDetailsTotal())}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ListCheck />
                  </EmptyMedia>
                  <EmptyTitle> No hay detalles agregados</EmptyTitle>
                  <EmptyDescription>
                    Agregue productos a la venta utilizando el formulario de
                    arriba.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </GroupFormSection>

          {/* Guías */}
          <GroupFormSection
            title="Guías de Remisión/Transporte"
            icon={FileText}
            cols={{
              sm: 1,
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <Form {...guideTempForm}>
                <FormSelect
                  control={guideTempForm.control}
                  name="temp_guide_type"
                  label="Tipo de Guía"
                  placeholder="Seleccione tipo"
                  options={[
                    { value: "remision", label: "Guía de Remisión" },
                    { value: "transportista", label: "Guía de Transportista" },
                  ]}
                />
              </Form>

              {selectedGuideType && (
                <Form {...guideTempForm}>
                  <FormSelect
                    control={guideTempForm.control}
                    name="temp_guide_id"
                    label={
                      selectedGuideType === "remision"
                        ? "Guía de Remisión"
                        : "Guía de Transportista"
                    }
                    placeholder="Seleccione guía"
                    options={
                      selectedGuideType === "remision"
                        ? (guidesRemision || []).map((guide) => ({
                            value: guide.id.toString(),
                            label: guide.full_guide_number,
                          }))
                        : (guidesCarrier || []).map((guide) => ({
                            value: guide.id.toString(),
                            label: guide.full_guide_number,
                          }))
                    }
                    disabled={
                      selectedGuideType === "remision"
                        ? isLoadingGuidesRemision
                        : isLoadingGuidesCarrier
                    }
                  />
                </Form>
              )}

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="default"
                  onClick={handleAddGuide}
                  disabled={!currentGuide.name || !currentGuide.correlative}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingGuideIndex !== null ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </div>

            {guides.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correlativo</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guides.map((guide, index) => (
                      <TableRow key={index}>
                        <TableCell>{guide.name}</TableCell>
                        <TableCell>{guide.correlative}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleEditGuide(index)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleRemoveGuide(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No hay guías agregadas</EmptyTitle>
                  <EmptyDescription>
                    Agregue guías de remisión o transporte utilizando el
                    formulario de arriba.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </GroupFormSection>

          {/* Métodos de Pago - Solo mostrar si es al contado */}
          {mode === "create" && selectedPaymentType === "CONTADO" && (
            <GroupFormSection
              title="Métodos de Pago"
              icon={CreditCard}
              cols={{
                sm: 1,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount_cash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto en Efectivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto con Tarjeta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount_yape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto Yape</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Mostrar total de pagos vs total de venta */}
              {details.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total de la Venta:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatNumber(calculateNetTotal())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Pagado:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(calculatePaymentTotal())}
                    </span>
                  </div>
                  {!paymentAmountsMatchTotal() && (
                    <Badge variant="orange">
                      El total pagado debe ser igual al total de la venta
                    </Badge>
                  )}
                </div>
              )}
            </GroupFormSection>
          )}

          {/* Cuotas - Solo mostrar si es a crédito */}
          {selectedPaymentType === "CREDITO" && (
            <GroupFormSection
              title="Información General"
              icon={FileText}
              cols={{
                sm: 1,
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <FormField
                  control={installmentTempForm.control}
                  name="temp_due_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días de Vencimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="30"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={installmentTempForm.control}
                  name="temp_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleAddInstallment}
                    disabled={
                      !currentInstallment.due_days || !currentInstallment.amount
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {editingInstallmentIndex !== null
                      ? "Actualizar"
                      : "Agregar"}
                  </Button>
                </div>
              </div>

              {installments.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">
                            Días Vencimiento
                          </TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-center">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {installments.map((inst, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-right">
                              {inst.due_days} días
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatDecimalTrunc(parseFloat(inst.amount), 6)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleEditInstallment(index)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveInstallment(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="text-right font-bold">
                            TOTAL CUOTAS:
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg text-blue-600">
                            {formatDecimalTrunc(
                              calculateInstallmentsTotal(),
                              6,
                            )}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  {!installmentsMatchTotal() && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <p className="text-sm text-orange-800 dark:text-orange-200 font-semibold">
                        ⚠️ El total de cuotas (
                        {formatNumber(calculateInstallmentsTotal())}) debe ser
                        igual al total de la venta (
                        {formatNumber(calculateNetTotal())})
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ListChecks />
                    </EmptyMedia>
                    <EmptyTitle>No hay cuotas agregadas</EmptyTitle>
                    <EmptyDescription>
                      Agregue cuotas a la venta utilizando el formulario de
                      arriba.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </GroupFormSection>
          )}

          {/* <pre>
          <code>{JSON.stringify(form.getValues(), null, 2)}</code>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre>
        <Button onClick={() => form.trigger()}>Button</Button> */}
        </div>

        <SaleSummary
          form={form}
          mode={mode}
          isSubmitting={isSubmitting}
          selectedCustomer={selectedCustomer}
          warehouses={warehouses}
          details={details}
          installments={installments}
          calculateDetailsSubtotal={calculateDetailsSubtotal}
          calculateDetailsIGV={calculateDetailsIGV}
          calculateDetailsTotal={calculateDetailsTotal}
          calculateRetencion={calculateRetencion}
          calculateNetTotal={calculateNetTotal}
          calculatePaymentTotal={calculatePaymentTotal}
          installmentsMatchTotal={installmentsMatchTotal}
          paymentAmountsMatchTotal={paymentAmountsMatchTotal}
          onCancel={onCancel}
          selectedPaymentType={selectedPaymentType}
        />
      </form>

      {/* Modal para crear nuevo cliente */}
      <ClientCreateModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />

      {/* Modal para crear nuevo almacén */}
      <WarehouseCreateModal
        open={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onWarehouseCreated={handleWarehouseCreated}
      />
    </Form>
  );
};
