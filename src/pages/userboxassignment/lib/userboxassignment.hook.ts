import { useEffect } from "react";
import { useUserBoxAssignmentStore } from "./userboxassignment.store";

export function useUserBoxAssignment(params?: Record<string, unknown>) {
  const { userBoxAssignments, meta, isLoading, error, fetchUserBoxAssignments } =
    useUserBoxAssignmentStore();

  useEffect(() => {
    if (!userBoxAssignments) fetchUserBoxAssignments(params);
  }, [userBoxAssignments, fetchUserBoxAssignments]);

  return {
    data: userBoxAssignments,
    meta,
    isLoading,
    error,
    refetch: fetchUserBoxAssignments,
  };
}

export function useAllUserBoxAssignments() {
  const { allUserBoxAssignments, isLoadingAll, error, fetchAllUserBoxAssignments } =
    useUserBoxAssignmentStore();

  useEffect(() => {
    if (!allUserBoxAssignments) fetchAllUserBoxAssignments();
  }, [allUserBoxAssignments, fetchAllUserBoxAssignments]);

  return {
    data: allUserBoxAssignments,
    isLoading: isLoadingAll,
    error,
    refetch: fetchAllUserBoxAssignments,
  };
}

export function useUserBoxAssignmentById(id: number) {
  const { userBoxAssignment, isFinding, error, fetchUserBoxAssignment } = useUserBoxAssignmentStore();

  useEffect(() => {
    fetchUserBoxAssignment(id);
  }, [id]);

  return {
    data: userBoxAssignment,
    isFinding,
    error,
    refetch: () => fetchUserBoxAssignment(id),
  };
}
