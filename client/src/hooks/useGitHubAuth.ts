import { useQuery } from "@tanstack/react-query";

export interface GitHubUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: GitHubUser;
}

export function useGitHubAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    isAuthenticated: data?.authenticated ?? false,
    user: data?.user,
    isLoading,
    error,
  };
}

export function connectGitHub() {
  window.location.href = "/api/auth/github";
}
