import { useCallback, useState } from "react";
import { User as TelegramUser } from "@telegram-apps/sdk-react";
import apiClient from "@/lib/services/api-client";
import { initData } from "@telegram-apps/sdk-react";

type UseFetchMeResult = {
  user: TelegramUser | null;
  loading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
};

/**
 * Hook to fetch or create the current user via the /api/users endpoint.
 * Sends the Telegram user object in the x-telegram-user header (as per route.ts).
 */
export function useFetchMe(): UseFetchMeResult {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient("/api/users", {
        method: "PUT",
        body: JSON.stringify({ user: initData.user() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to fetch user");
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, fetchMe };
}
