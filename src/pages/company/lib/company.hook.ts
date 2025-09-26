import { useEffect } from "react";
import { useCompanyStore } from "./company.store";

export function useCompany(params?: Record<string, any>) {
  const { companies, meta, isLoading, error, fetchCompanies } =
    useCompanyStore();

  useEffect(() => {
    if (!companies) fetchCompanies(params);
  }, [companies, fetchCompanies]);

  return {
    data: companies,
    meta,
    isLoading,
    error,
    refetch: fetchCompanies,
  };
}

export function useAllCompanies() {
  const { allCompanies, isLoadingAll, error, fetchAllCompanies } =
    useCompanyStore();

  useEffect(() => {
    if (!allCompanies) fetchAllCompanies();
  }, [allCompanies, fetchAllCompanies]);

  return {
    data: allCompanies,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllCompanies,
  };
}

export function useCompanyById(id: number) {
  const { company, isFinding, error, fetchCompany } = useCompanyStore();

  useEffect(() => {
    fetchCompany(id);
  }, [id]);

  return {
    data: company,
    isFinding,
    error,
    refetch: () => fetchCompany(id),
  };
}