import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../lib/db/src/schema/index.ts";

const connectionString = Deno.env.get("DATABASE_URL")!;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { 
  prepare: false,
  max: 1, // Edge functions should use 1 connection per instance to avoid overhead
  idle_timeout: 20, // Close idle connections faster
  connect_timeout: 10,
});
export const db = drizzle(client, { schema });
export * from "../../../lib/db/src/schema/index.ts";
