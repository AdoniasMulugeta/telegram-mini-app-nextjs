import { NextResponse } from "next/server";
import { createRoute } from "@/lib/route-builder";
import {
  createUserFromTelegram,
  getUserByTelegramId,
} from "@/lib/services/user-service";

export const PUT = createRoute()
  .withTelegramAuth()
  .handle(async (_, context) => {
    const telegramUser = context.telegramUser;

    if (!telegramUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let user = await getUserByTelegramId(telegramUser.id.toString());

    if (!user) {
      user = await createUserFromTelegram(telegramUser);
    }

    return NextResponse.json({ user });
  });
