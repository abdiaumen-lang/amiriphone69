import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";

export function useHomeData() {
  return useQuery({
    queryKey: ["home-data"],
    queryFn: () => customFetch<any>("/api/home-data"),
    staleTime: 60_000,
  });
}

