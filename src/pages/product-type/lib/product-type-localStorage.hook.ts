import { useState, useEffect, useCallback } from "react";
import type { ProductTypeResource } from "./product-type.interface";
import type { ProductTypeSchema } from "./product-type.schema";

const STORAGE_KEY = "product-types";

// Tipo por defecto que siempre debe existir
const DEFAULT_PRODUCT_TYPE: ProductTypeResource = {
  id: 1,
  code: "NORMAL",
  name: "Normal",
  created_at: new Date().toISOString(),
};

// Función para obtener los tipos de producto del localStorage
const getProductTypesFromStorage = (): ProductTypeResource[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Asegurar que siempre existe el tipo NORMAL
      const hasNormal = parsed.some((pt: ProductTypeResource) => pt.code === "NORMAL");
      if (!hasNormal) {
        return [DEFAULT_PRODUCT_TYPE, ...parsed];
      }
      return parsed;
    }
    return [DEFAULT_PRODUCT_TYPE];
  } catch (error) {
    console.error("Error al leer del localStorage:", error);
    return [DEFAULT_PRODUCT_TYPE];
  }
};

// Función para guardar en localStorage
const saveProductTypesToStorage = (productTypes: ProductTypeResource[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productTypes));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
};

// Función para generar un nuevo ID
const generateId = (productTypes: ProductTypeResource[]): number => {
  if (productTypes.length === 0) return 1;
  return Math.max(...productTypes.map(pt => pt.id)) + 1;
};

export function useProductTypeLocalStorage() {
  const [productTypes, setProductTypes] = useState<ProductTypeResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cargar datos al montar
  useEffect(() => {
    const data = getProductTypesFromStorage();
    setProductTypes(data);
  }, []);

  // Obtener todos los tipos
  const fetchAll = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getProductTypesFromStorage();
      setProductTypes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error desconocido"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear nuevo tipo
  const create = useCallback((data: ProductTypeSchema) => {
    setIsLoading(true);
    try {
      const currentTypes = getProductTypesFromStorage();
      const newType: ProductTypeResource = {
        id: generateId(currentTypes),
        ...data,
        created_at: new Date().toISOString(),
      };
      const updatedTypes = [...currentTypes, newType];
      saveProductTypesToStorage(updatedTypes);
      setProductTypes(updatedTypes);
      setError(null);
      return newType;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al crear");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar tipo existente
  const update = useCallback((id: number, data: Partial<ProductTypeSchema>) => {
    setIsLoading(true);
    try {
      const currentTypes = getProductTypesFromStorage();
      const index = currentTypes.findIndex(pt => pt.id === id);

      if (index === -1) {
        throw new Error("Tipo de producto no encontrado");
      }

      // No permitir editar el tipo NORMAL (id: 1)
      if (id === 1) {
        throw new Error("No se puede editar el tipo de producto por defecto");
      }

      const updatedType = {
        ...currentTypes[index],
        ...data,
      };

      const updatedTypes = [...currentTypes];
      updatedTypes[index] = updatedType;

      saveProductTypesToStorage(updatedTypes);
      setProductTypes(updatedTypes);
      setError(null);
      return updatedType;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al actualizar");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar tipo
  const remove = useCallback((id: number) => {
    setIsLoading(true);
    try {
      // No permitir eliminar el tipo NORMAL (id: 1)
      if (id === 1) {
        throw new Error("No se puede eliminar el tipo de producto por defecto");
      }

      const currentTypes = getProductTypesFromStorage();
      const updatedTypes = currentTypes.filter(pt => pt.id !== id);

      saveProductTypesToStorage(updatedTypes);
      setProductTypes(updatedTypes);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error al eliminar");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener por ID
  const getById = useCallback((id: number) => {
    const currentTypes = getProductTypesFromStorage();
    return currentTypes.find(pt => pt.id === id);
  }, []);

  return {
    productTypes,
    isLoading,
    error,
    fetchAll,
    create,
    update,
    remove,
    getById,
  };
}
