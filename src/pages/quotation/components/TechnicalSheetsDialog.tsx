import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface TechnicalSheetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicalSheets: string[];
  productName: string;
}

export function TechnicalSheetsDialog({
  open,
  onOpenChange,
  technicalSheets,
  productName,
}: TechnicalSheetsDialogProps) {
  const getFileName = (url: string) => {
    return url.split("/").pop() || "Archivo";
  };

  const getFileExtension = (url: string) => {
    const fileName = getFileName(url);
    return fileName.split(".").pop()?.toUpperCase() || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fichas Técnicas - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {technicalSheets.length > 0 ? (
            <div className="space-y-3">
              {technicalSheets.map((sheet, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium text-base truncate">
                          {getFileName(sheet)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Documento {getFileExtension(sheet)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        
                        onClick={() => window.open(sheet, "_blank")}
                        className="gap-2 flex-1"
                      >
                        <Download className="h-4 w-4" />
                        Ver / Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No hay fichas técnicas</EmptyTitle>
                <EmptyDescription>
                  Este producto no tiene fichas técnicas disponibles
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
