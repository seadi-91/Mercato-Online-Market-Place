import { Pool } from "pg";

let orderPool: Pool | null = null;
let catalogPool: Pool | null = null;
let paymentPool: Pool | null = null;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
};

export function getOrderDbPool(): Pool {
  if (!orderPool) {
    orderPool = new Pool({
      ...dbConfig,
      database: process.env.ORDERS_DB_NAME || "mercatox_order_db",
      max: 10,
      idleTimeoutMillis: 30000,
    });

    orderPool.on("error", (err) => {
      console.error("[OrderDB Pool Error]", err);
    });
  }
  return orderPool;
}

export function getPaymentDbPool(): Pool {
  if (!paymentPool) {
    paymentPool = new Pool({
      ...dbConfig,
      database: process.env.PAYMENTS_DB_NAME || "mercatox_payment_db",
      max: 10,
      idleTimeoutMillis: 30000,
    });

    paymentPool.on("error", (err) => {
      console.error("[PaymentDB Pool Error]", err);
    });
  }
  return paymentPool;
}

export function getCatalogDbPool(): Pool {
  if (!catalogPool) {
    catalogPool = new Pool({
      ...dbConfig,
      database: process.env.CATALOG_DB_NAME || "mercatox_catalog_db",
      max: 10,
      idleTimeoutMillis: 30000,
    });

    catalogPool.on("error", (err) => {
      console.error("[CatalogDB Pool Error]", err);
    });
  }
  return catalogPool;
}

let usersPool: Pool | null = null;
export function getUsersDbPool(): Pool {
  if (!usersPool) {
    usersPool = new Pool({
      ...dbConfig,
      database: process.env.USERS_DB_NAME || "mercatox_users_db",
      max: 10,
      idleTimeoutMillis: 30000,
    });

    usersPool.on("error", (err) => {
      console.error("[UsersDB Pool Error]", err);
    });
  }
  return usersPool;
}

