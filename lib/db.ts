import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let dbInstance: NodePgDatabase | null = null;

export async function getDatabaseInstance(): Promise<NodePgDatabase> {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be defined in the environment variables"
      );
    }

    try {
      // Initialize the PostgreSQL pool using 'pg' with optimized settings
      const pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 5, // maximum number of clients in the pool
        idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
        connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
      });

      // Test the connection
      await pool.query("SELECT NOW()");

      // Create a Drizzle database instance using the pool
      dbInstance = drizzle(pool);

      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Failed to establish database connection:", error);
      throw error;
    }
  }

  return dbInstance;
}
