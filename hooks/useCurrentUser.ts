"use client"
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

async function fetchUserId(clerkId: string): Promise<string | undefined> {
    const response = await fetch(`/api/user?clerkId=${clerkId}`);
    const data = await response.json();
    return data.userId;
}

export function useCurrentUser() {
    const { userId: clerkId } = useAuth();

    return useQuery({
        queryKey: ['userId', clerkId],
        queryFn: () => fetchUserId(clerkId!),
        enabled: !!clerkId
    });
}
