import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { FileText, Download, Trash2, Upload } from "lucide-react";
import { deleteTechnicalSheet } from "../lib/product.actions";
import { useProductStore } from "../lib/product.store";
import {
  successToast,
  errorToast,
} from "@/lib/core.function";

interface ProductTechnicalSheetsProps {
  technicalSheets: string[];
  productId: number;
}

export function ProductTechnicalSheets({
  technicalSheets,
  productId
}: ProductTechnicalSheetsProps) {
  const [deleteSheetValue, setDeleteSheetValue] = useState<string | null>(null);
  const { fetchProduct } = useProductStore();

  const handleDeleteTechnicalSheet = async () => {
    if (!deleteSheetValue || !productId) return;
    try {
      await deleteTechnicalSheet(productId, {
        value: deleteSheetValue,
      });
      await fetchProduct(productId);
      successToast("Ficha técnica eliminada exitosamente");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al eliminar la ficha técnica";
      errorToast(errorMessage);
    } finally {
      setDeleteSheetValue(null);
    }
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Archivo';
  };

  const getFileExtension = (url: string) => {
    const fileName = getFileName(url);
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  return (
    <div className="space-y-4">
      {technicalSheets.length > 0 ? (
        <div className="grid gap-3">
          {technicalSheets.map((sheet, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{getFileName(sheet)}</p>
                  <p className="text-sm text-muted-foreground">
                    Documento {getFileExtension(sheet)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(sheet, '_blank')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteSheetValue(sheet)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-xl">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay fichas técnicas</h3>
          <p className="text-muted-foreground mb-4">
            Este producto no tiene fichas técnicas asociadas
          </p>
          <p className="text-sm text-muted-foreground">
            Las fichas técnicas se pueden agregar al editar el producto
          </p>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteSheetValue !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteSheetValue(null)}
          onConfirm={handleDeleteTechnicalSheet}
          title="Eliminar Ficha Técnica"
          description="¿Está seguro de que desea eliminar esta ficha técnica? Esta acción no se puede deshacer."
        />
      )}
    </div>
  );
}