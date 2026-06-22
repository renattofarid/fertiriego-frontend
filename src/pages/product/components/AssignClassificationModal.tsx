import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { GeneralModal } from "@/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { FormSelect } from "@/components/FormSelect";
import { FormTextArea } from "@/components/FormTextArea";
import { SearchableSelectAsync } from "@/components/SearchableSelectAsync";
import { assignClassification } from "@/pages/product-tag/lib/classification.actions";
import { useProductTag } from "@/pages/product-tag/lib/product-tag.hook";
import { PRODUCT_TAG, type TagResource } from "@/pages/product-tag/lib/product-tag.interface";
import { errorToast, successToast } from "@/lib/core.function";
import { useQueryClient } from "@tanstack/react-query";

const assignSchema = z.object({
  priority: z.enum(["A", "B", "C"], {
    required_error: "La prioridad es requerida",
  }),
  notes: z
    .string()
    .max(500, { message: "Las notas no pueden tener más de 500 caracteres" })
    .optional()
    .or(z.literal("")),
});

type AssignSchema = z.infer<typeof assignSchema>;

const PRIORITY_OPTIONS = [
  { value: "A", label: "A — Alta prioridad" },
  { value: "B", label: "B — Prioridad media" },
  { value: "C", label: "C — Baja prioridad" },
];

interface Props {
  open: boolean;
  productIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignClassificationModal({
  open,
  productIds,
  onClose,
  onSuccess,
}: Props) {
  const [selectedTags, setSelectedTags] = useState<TagResource[]>([]);
  const [tagSearchValue, setTagSearchValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AssignSchema>({
    resolver: zodResolver(assignSchema),
    defaultValues: { priority: "A", notes: "" },
    mode: "onChange",
  });

  const addTag = (_value: string, rawItem?: any) => {
    const tagData = rawItem as TagResource;
    if (!tagData) return;
    if (!selectedTags.find((t) => t.id === tagData.id)) {
      setSelectedTags((prev) => [...prev, tagData]);
    }
    setTagSearchValue("");
  };

  const removeTag = (id: number) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = async (data: AssignSchema) => {
    if (selectedTags.length === 0) {
      errorToast("Seleccione al menos una etiqueta");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignClassification({
        product_ids: productIds,
        tag_ids: selectedTags.map((t) => t.id),
        priority: data.priority,
        notes: data.notes || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: [PRODUCT_TAG.QUERY_KEY] });
      successToast("Clasificación asignada exitosamente");
      onSuccess();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Error al asignar clasificación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Asignar Clasificación"
      maxWidth="!max-w-2xl"
      icon="Tags"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 w-full">
          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            Asignando clasificación a{" "}
            <span className="font-semibold text-foreground">{productIds.length}</span>{" "}
            producto{productIds.length !== 1 ? "s" : ""} seleccionado{productIds.length !== 1 ? "s" : ""}.
          </div>

          <div className="space-y-2 bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium leading-none">Etiquetas</p>
            <SearchableSelectAsync
              value={tagSearchValue}
              onChange={setTagSearchValue}
              onValueChange={addTag}
              placeholder="Buscar y agregar etiquetas..."
              useQueryHook={useProductTag}
              mapOptionFn={(tag: TagResource) => ({
                value: tag.id.toString(),
                label: tag.name,
                description: tag.type,
              })}
            />

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="flex items-center gap-1 cursor-pointer pr-1"
                    style={{ backgroundColor: tag.color, color: "#fff" }}
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 rounded-full hover:bg-black/20 p-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {selectedTags.length === 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                Sin etiquetas seleccionadas
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
            <FormSelect
              control={form.control}
              name="priority"
              label="Prioridad"
              placeholder="Seleccione prioridad"
              options={PRIORITY_OPTIONS}
            />

            <div className="md:col-span-2">
              <FormTextArea
                control={form.control}
                name="notes"
                label="Notas (Opcional)"
                placeholder="Notas adicionales sobre esta clasificación..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`} />
              {isSubmitting ? "Asignando..." : "Asignar Clasificación"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
