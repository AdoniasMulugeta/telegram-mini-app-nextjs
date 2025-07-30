import { NextRequest, NextResponse } from "next/server";
import { validateInitData, parseUserFromInitData } from "@/lib/services/telegram-service";
import { User as TelegramUser } from "@telegram-apps/init-data-node";
import logger from "./util/logger";

export interface AuthResult {
  isValid: boolean;
  telegramUser?: TelegramUser;
  error?: string;
  response?: NextResponse;
}

export async function validateTelegramAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("tma ")) {
    return {
      isValid: false,
      error: "Unauthorized",
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const initData = authHeader.slice(4).trim();
  
  try {
    const isValid = await validateInitData(initData);
    
    if (!isValid) {
      return {
        isValid: false,
        error: "Invalid initData",
        response: NextResponse.json({ error: "Invalid initData" }, { status: 401 })
      };
    }

    const telegramUser = await parseUserFromInitData(initData);
    
    if (!telegramUser) {
      return {
        isValid: false,
        error: "User not found",
        response: NextResponse.json({ error: "User not found" }, { status: 404 })
      };
    }

    return {
      isValid: true,
      telegramUser
    };
  } catch (error) {
    logger.error("Auth validation error:", error);
    return {
      isValid: false,
      error: "Internal server error",
      response: NextResponse.json({ error: "Internal server error" }, { status: 500 })
    };
  }
}