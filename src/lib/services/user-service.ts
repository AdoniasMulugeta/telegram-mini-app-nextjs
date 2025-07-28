import { prisma } from "@/lib/prisma";
import { User as TelegramUserData } from "@telegram-apps/init-data-node";
import { auth } from "@/lib/auth";
import { randomUUID } from "node:crypto";

export const getUserByEmail = async (email: string) => {
  const response = await auth.api.accountInfo({
    body: {
      accountId: email,
    },
  });

  return response?.user;
};

export const signUpWithEmail = async ({
  email,
  password,
  name,
  image,
}: {
  email: string;
  password: string;
  name: string;
  image: string;
}) => {
  const signUpResponse = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
      image,
    },
  });

  return signUpResponse;
};

export const calculateEmail = (telegramId: number) => {
  return `${telegramId}@telegram.local`;
};

export const calculatePassword = (telegramId: number) => {
  return telegramId.toString();
};

export const createUserFromTelegram = async (userData: TelegramUserData) => {
  const { user } = await signUpWithEmail({
    email: calculateEmail(userData.id),
    password: calculatePassword(userData.id),
    name: userData.first_name ?? "",
    image: userData.photo_url ?? "",
  });

  await prisma.telegramUser.create({
    data: {
      id: randomUUID(),
      telegramId: userData.id.toString(),
      firstName: userData.first_name,
      lastName: userData.last_name ?? "",
      username: userData.username ?? "",
      photoUrl: userData.photo_url,
      languageCode: userData.language_code,
      isPremium: userData.is_premium ?? false,
      isBot: userData.is_bot ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return await getUserById(user.id);
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      telegramUser: true,
    },
  });
};

export const getUserByTelegramId = async (telegramId: string) => {
  return prisma.user.findFirst({
    where: {
      telegramUser: {
        telegramId,
      },
    },
    include: {
      telegramUser: true,
    },
  });
};
