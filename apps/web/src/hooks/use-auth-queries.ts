import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

const AUTH_STALE_TIME = 5 * 60 * 1000;

function isAuthRequired(error: { message?: string } | null | undefined) {
	return /auth|unauthorized|unauthenticated|required/i.test(error?.message ?? "");
}

export function useSessionQuery() {
	return useQuery({
		queryKey: ["auth", "session"],
		queryFn: async () => {
			const { data, error } = await authClient.getSession();

			if (error) {
				if (isAuthRequired(error)) {
					return null;
				}

				throw new Error(error.message ?? "Unable to load session.");
			}

			return data;
		},
		staleTime: AUTH_STALE_TIME,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}

export function useOrganizationsQuery() {
	const sessionQuery = useSessionQuery();

	return useQuery({
		queryKey: ["auth", "organizations"],
		queryFn: async () => {
			const { data, error } = await authClient.organization.list();

			if (error) {
				if (isAuthRequired(error)) {
					return [];
				}

				throw new Error(error.message ?? "Unable to load sites.");
			}

			return data;
		},
		staleTime: AUTH_STALE_TIME,
		gcTime: 30 * 60 * 1000,
		refetchOnWindowFocus: false,
		enabled: Boolean(sessionQuery.data),
	});
}
