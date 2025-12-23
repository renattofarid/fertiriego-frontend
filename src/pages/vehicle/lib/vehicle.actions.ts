import { api } from "@/lib/config";
import type { getVehicleProps, VehicleResponse, VehicleResourceById } from "./vehicle.interface";
import type { VehicleSchema } from "./vehicle.schema";

export const getVehicles = async ({ params }: getVehicleProps = {}): Promise<VehicleResponse> => {
  const response = await api.get("/vehicles", { params });
  return response.data;
};

export const getVehicleById = async (id: number): Promise<VehicleResourceById> => {
  const response = await api.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (data: VehicleSchema): Promise<VehicleResourceById> => {
  const response = await api.post("/vehicles", data);
  return response.data;
};

export const updateVehicle = async (id: number, data: VehicleSchema): Promise<VehicleResourceById> => {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
