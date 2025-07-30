"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { initData } from "@telegram-apps/sdk-react";
import { Prisma } from "@prisma/client";

type UserWithTelegram = Prisma.UserGetPayload<{
  include: {
    telegramUser: true;
  };
}>;

interface UserContextValue {
  userQuery: UseQueryResult<UserWithTelegram | null, Error>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

async function fetchUser(): Promise<UserWithTelegram | null> {
  const telegramUser = initData.user();
  if (!telegramUser) {
    return null;
  }

  const data = await apiClient("/api/users", {
    method: "PUT",
    body: JSON.stringify({ user: telegramUser }),
  });

  return data.user;
}

export function UserProvider({ children }: PropsWithChildren) {
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false,
    enabled: !!initData.user(), // Only fetch if we have a telegram user
  });

  return (
    <UserContext.Provider value={{ userQuery }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context.userQuery;
}
