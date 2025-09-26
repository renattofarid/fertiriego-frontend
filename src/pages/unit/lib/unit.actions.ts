import { api } from "@/lib/config";
import type { getUnitProps, UnitResponse, UnitResourceById } from "./unit.interface";
import type { UnitSchema } from "./unit.schema";

export const getUnits = async ({ params }: getUnitProps = {}): Promise<UnitResponse> => {
  const response = await api.get("/unit", { params });
  return response.data;
};

export const getUnitById = async (id: number): Promise<UnitResourceById> => {
  const response = await api.get(`/unit/${id}`);
  return response.data;
};

export const createUnit = async (data: UnitSchema): Promise<UnitResourceById> => {
  const response = await api.post("/unit", data);
  return response.data;
};

export const updateUnit = async (id: number, data: UnitSchema): Promise<UnitResourceById> => {
  const response = await api.put(`/unit/${id}`, data);
  return response.data;
};

export const deleteUnit = async (id: number): Promise<void> => {
  await api.delete(`/unit/${id}`);
};