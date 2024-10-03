import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg"; // Use 'pg' library

async function runMigrations() {
  let pool: Pool | undefined; // Declare pool outside of try block

  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL must be defined");
    }

    // Initialize the PostgreSQL pool using 'pg'
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Important for Supabase connections
      },
    });

    // Create a Drizzle database instance using the pool
    const db = drizzle(pool);

    // Run migrations from the specified folder
    await migrate(db, {
      migrationsFolder: "./drizzle/migrations",
    });

    console.log("Migrations applied successfully");
  } catch (error) {
    console.error("Failed to run migrations:", error);
  } finally {
    // Ensure the pool is closed when done
    if (pool) {
      await pool.end();
    }
  }
}

runMigrations();
