import { NextRequest, NextResponse } from "next/server";
import { User as TelegramUser } from "@telegram-apps/init-data-node";
import { validateTelegramAuth } from "./validate-telegram-data";
import logger from "./util/logger";

// Context types that can be accumulated through the builder chain
interface BaseContext {
  request: NextRequest;
}

interface TelegramAuthContext extends BaseContext {
  telegramUser: TelegramUser;
}

interface RateLimitContext {
  rateLimit: {
    remaining: number;
    limit: number;
    reset: Date;
  };
}

interface CorsContext {
  corsHeaders: HeadersInit;
}

interface ValidationContext<T> {
  validated: T;
}

interface CacheContext {
  cache: {
    key: string;
    ttl: number;
  };
}

interface BodyContext<T> {
  body: T;
}

interface QueryParamsContext<T> {
  query: T;
}

interface PathParamsContext<T> {
  params: T;
}

interface SearchParamsContext {
  searchParams: URLSearchParams;
}

// Type helper to merge contexts
type MergeContext<T, U> = T & U;

// Handler type that receives the accumulated context
type RouteHandler<TContext> = (
  request: NextRequest,
  context: TContext
) => Promise<Response> | Response;

// Rate limit options
interface RateLimitOptions {
  requests: number;
  window: string;
}

// CORS options
interface CorsOptions {
  origins: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
}

// Validation schema type
type ValidationSchema<T> = {
  parse: (data: unknown) => T;
};

// Cache options
interface CacheOptions {
  ttl: number;
  key?: (request: NextRequest) => string;
}

export class RouteBuilder<TContext extends BaseContext = BaseContext> {
  private middlewares: Array<
    (request: NextRequest, context: any, ...args: any[]) => Promise<any>
  > = [];

  // Add Telegram authentication
  withTelegramAuth(): RouteBuilder<
    MergeContext<TContext, TelegramAuthContext>
  > {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, TelegramAuthContext>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        const authResult = await validateTelegramAuth(request);

        if (!authResult.isValid) {
          throw authResult.response;
        }

        return {
          ...context,
          telegramUser: authResult.telegramUser,
        };
      },
    ];

    return newBuilder;
  }

  // Add rate limiting
  withRateLimit(
    options: RateLimitOptions
  ): RouteBuilder<MergeContext<TContext, RateLimitContext>> {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, RateLimitContext>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        // Simple in-memory rate limiting (in production, use Redis or similar)
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const key = `ratelimit:${ip}`;

        // For demo purposes, we'll just add the rate limit info
        // In a real implementation, you'd check against a store
        return {
          ...context,
          rateLimit: {
            remaining: options.requests - 1,
            limit: options.requests,
            reset: new Date(Date.now() + 60000), // 1 minute from now
          },
        };
      },
    ];

    return newBuilder;
  }

  // Add CORS headers
  withCors(
    options: CorsOptions
  ): RouteBuilder<MergeContext<TContext, CorsContext>> {
    const newBuilder = new RouteBuilder<MergeContext<TContext, CorsContext>>();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        const origin = request.headers.get("origin") || "";
        const allowedOrigin = options.origins.includes("*")
          ? "*"
          : options.origins.find((o) => o === origin) || "";

        const corsHeaders: HeadersInit = {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods":
            options.methods?.join(", ") || "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            options.headers?.join(", ") || "Content-Type, Authorization",
        };

        if (options.credentials) {
          corsHeaders["Access-Control-Allow-Credentials"] = "true";
        }

        return {
          ...context,
          corsHeaders,
        };
      },
    ];

    return newBuilder;
  }

  // Add request validation
  withValidation<T>(
    schema: ValidationSchema<T>
  ): RouteBuilder<MergeContext<TContext, ValidationContext<T>>> {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, ValidationContext<T>>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        try {
          const body = await request.json();
          const validated = schema.parse(body);

          return {
            ...context,
            validated,
          };
        } catch (error) {
          throw NextResponse.json(
            { error: "Validation failed", details: error },
            { status: 400 }
          );
        }
      },
    ];

    return newBuilder;
  }

  // Add caching
  withCache(
    options: CacheOptions
  ): RouteBuilder<MergeContext<TContext, CacheContext>> {
    const newBuilder = new RouteBuilder<MergeContext<TContext, CacheContext>>();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        const key = options.key ? options.key(request) : request.url;

        return {
          ...context,
          cache: {
            key,
            ttl: options.ttl,
          },
        };
      },
    ];

    return newBuilder;
  }

  // Parse request body
  withBody<T = any>(): RouteBuilder<MergeContext<TContext, BodyContext<T>>> {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, BodyContext<T>>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        try {
          const body = await request.json();
          return {
            ...context,
            body: body as T,
          };
        } catch (error) {
          throw NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
          );
        }
      },
    ];

    return newBuilder;
  }

  // Parse query parameters
  withQueryParams<T = Record<string, string>>(): RouteBuilder<
    MergeContext<TContext, QueryParamsContext<T>>
  > {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, QueryParamsContext<T>>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        const { searchParams } = new URL(request.url);
        const query: any = {};

        searchParams.forEach((value, key) => {
          query[key] = value;
        });

        return {
          ...context,
          query: query as T,
        };
      },
    ];

    return newBuilder;
  }

  // Parse path parameters (for dynamic routes)
  withPathParams<T = Record<string, string>>(): RouteBuilder<
    MergeContext<TContext, PathParamsContext<T>>
  > {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, PathParamsContext<T>>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any, ...args: any[]) => {
        // In Next.js App Router, path params are passed as the second argument
        const params = args[0]?.params || {};

        return {
          ...context,
          params: params as T,
        };
      },
    ];

    return newBuilder;
  }

  // Get raw search params
  withSearchParams(): RouteBuilder<
    MergeContext<TContext, SearchParamsContext>
  > {
    const newBuilder = new RouteBuilder<
      MergeContext<TContext, SearchParamsContext>
    >();

    newBuilder.middlewares = [
      ...this.middlewares,
      async (request: NextRequest, context: any) => {
        const { searchParams } = new URL(request.url);

        return {
          ...context,
          searchParams,
        };
      },
    ];

    return newBuilder;
  }

  // Final handler method
  handle(
    handler: RouteHandler<TContext>
  ): (request: NextRequest, ...args: any[]) => Promise<Response> {
    return async (request: NextRequest, ...args: any[]) => {
      try {
        // Start with base context
        let context: any = { request };

        // Run all middlewares in sequence
        for (const middleware of this.middlewares) {
          const result = await middleware(request, context, ...args);
          // If middleware returns a Response, return it immediately
          if (result instanceof Response || result instanceof NextResponse) {
            return result;
          }
          context = result;
        }

        // Call the final handler with accumulated context
        const response = await handler(request, context);

        // Add CORS headers if they exist
        if (context.corsHeaders) {
          const headers = new Headers(response.headers);
          Object.entries(context.corsHeaders).forEach(([key, value]) => {
            headers.set(key, value as string);
          });

          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }

        if (process.env.NODE_ENV === "development") {
          const responseData = await extractResponse(response);
          logger.info(responseData);
        }

        return response;
      } catch (error) {
        if (error instanceof Response || error instanceof NextResponse) {
          return error;
        }

        // Otherwise, return a generic error response
        logger.error("Route handler error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    };
  }
}

// Helper function to create a new builder instance
export function createRoute() {
  return new RouteBuilder();
}

// Helper function to extract and log response content
async function extractResponse(response: Response): Promise<any> {
  let responseData = null;
  try {
    if (response.body) {
      const clonedResponse = response.clone();
      responseData = await clonedResponse.json();
    }
  } catch (error) {
    // If it's not JSON, try to get as text
    try {
      const clonedResponse = response.clone();
      responseData = await clonedResponse.text();
    } catch (textError) {
      responseData = "Unable to extract response content";
    }
  }

  return responseData;
}
