import type { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

// Express requires the 4-argument signature to treat this as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Zod validation errors arrive as plain Error objects with a structured message.
  if (err instanceof Error && err.name === "ZodError") {
    res.status(422).json({ error: "Validation error", details: err.message });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}
