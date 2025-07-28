import { NextResponse } from "next/server";
import { createRoute } from "@/lib/auth/route-builder";

export const PUT = createRoute()
  .withTelegramAuth()
  .handle(async (_, context) => {
    try {
      const user = context.user

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // You can add logic here to create or update the user in your database if needed
      // context.user contains the authenticated user from the validated initData
      console.log("Authenticated user:", context.user.id);

      return NextResponse.json({ user });
    } catch (error) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
