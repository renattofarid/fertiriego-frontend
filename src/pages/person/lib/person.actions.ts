import { api } from "@/lib/config";
import {
  PERSON,
  type GetPersonsProps,
  type PersonResource,
  type PersonResourceById,
  type PersonResponse,
  type CreatePersonRequest,
  type UpdatePersonRequest,
  type UpdatePersonRolesRequest,
  type PersonRolesResponse,
  type PersonRoleDetailResource,
} from "./person.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const { ENDPOINT } = PERSON;

export async function getPersons({
  params,
}: GetPersonsProps): Promise<PersonResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<PersonResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPersons(): Promise<PersonResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
    },
  };
  const { data } = await api.get<PersonResource[]>(ENDPOINT, config);
  return data;
}

export async function findPersonById(
  id: number
): Promise<PersonResourceById> {
  const response = await api.get<PersonResourceById>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function createPerson(
  data: CreatePersonRequest
): Promise<{ message: string; data?: { id: number } }> {
  const response = await api.post<{ message: string; data?: { id: number } }>(ENDPOINT, data);
  return response.data;
}

// Helper function to create person and assign specific role
export async function createPersonWithRole(
  data: CreatePersonRequest,
  roleId: number
): Promise<{ message: string }> {
  // First create the person
  const createResponse = await createPerson(data);

  // If the person was created successfully and we have the ID, assign the role
  if (createResponse.data?.id) {
    const personId = createResponse.data.id;

    // Assign the specific role
    await updatePersonRoles(personId, {
      roles: [
        { role_id: roleId, status: true }
      ]
    });
  }

  return createResponse;
}

export async function updatePerson(
  id: number,
  data: UpdatePersonRequest
): Promise<{ message: string }> {
  const response = await api.put<{ message: string }>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deletePerson(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
  return data;
}

// Person Roles Management
export async function getPersonRoles(
  personId: number
): Promise<PersonRolesResponse> {
  const { data } = await api.get<PersonRolesResponse>(`${ENDPOINT}/${personId}/roles`);
  return data;
}

export async function updatePersonRoles(
  personId: number,
  request: UpdatePersonRolesRequest
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`${ENDPOINT}/${personId}/roles`, request);
  return data;
}

// New function using the personrole endpoint
export async function getPersonRoleDetails(
  personId: number
): Promise<PersonRoleDetailResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      person_id: personId,
    },
  };
  const { data } = await api.get<PersonRoleDetailResource[]>("/personrole", config);
  return data;
}