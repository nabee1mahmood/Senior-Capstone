import pg from "pg"

const connectionString = process.env.DATABASE_URL

export const pool = connectionString
  ? new pg.Pool({ connectionString })
  : null

export async function query(text, params) {
  if (!pool) {
    throw new Error("DATABASE_URL is not set")
  }
  return pool.query(text, params)
}
