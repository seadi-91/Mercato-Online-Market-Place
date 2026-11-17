import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getUsersDbPool } from "@/lib/db";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOGS_FILE = path.join(DATA_DIR, "audit-logs.json");

function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

function readLocalLogs(): any[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(LOGS_FILE, "utf8");
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function writeLocalLogs(logs: any[]): void {
  ensureStorage();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf8");
}

/**
 * GET /api/admin/audit-logs
 * Fetch audit logs with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "30", 10));
    const action = searchParams.get("action");
    const actorRole = searchParams.get("actorRole");
    const actorId = searchParams.get("actorId");
    const targetEntity = searchParams.get("targetEntity");
    const targetId = searchParams.get("targetId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search")?.toLowerCase();

    // 1. Try PostgreSQL Database
    try {
      const pool = getUsersDbPool();
      const client = await pool.connect();
      try {
        let whereClauses: string[] = [];
        let queryParams: any[] = [];
        let pIndex = 1;

        if (action) {
          whereClauses.push(`action = $${pIndex++}`);
          queryParams.push(action);
        }
        if (actorRole) {
          whereClauses.push(`"actorRole" = $${pIndex++}`);
          queryParams.push(actorRole);
        }
        if (actorId) {
          whereClauses.push(`"actorId"::text ILIKE $${pIndex++}`);
          queryParams.push(`%${actorId}%`);
        }
        if (targetEntity) {
          whereClauses.push(`"targetEntity" = $${pIndex++}`);
          queryParams.push(targetEntity);
        }
        if (targetId) {
          whereClauses.push(`"targetId" = $${pIndex++}`);
          queryParams.push(targetId);
        }
        if (startDate) {
          whereClauses.push(`"createdAt" >= $${pIndex++}`);
          queryParams.push(new Date(startDate).toISOString());
        }
        if (endDate) {
          whereClauses.push(`"createdAt" <= $${pIndex++}`);
          queryParams.push(new Date(endDate).toISOString());
        }
        if (search) {
          whereClauses.push(
            `("action"::text ILIKE $${pIndex} OR "actorRole"::text ILIKE $${pIndex} OR "targetEntity"::text ILIKE $${pIndex} OR "targetId"::text ILIKE $${pIndex} OR "ipAddress"::text ILIKE $${pIndex})`
          );
          queryParams.push(`%${search}%`);
          pIndex++;
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const countRes = await client.query(`SELECT COUNT(*)::int as total FROM audit_logs ${whereSql}`, queryParams);
        const total = countRes.rows[0]?.total ?? 0;

        const offset = (page - 1) * limit;
        const dataRes = await client.query(
          `SELECT * FROM audit_logs ${whereSql} ORDER BY "createdAt" DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`,
          [...queryParams, limit, offset]
        );

        return NextResponse.json({
          data: dataRes.rows,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        });
      } finally {
        client.release();
      }
    } catch {
      // Postgres error or not connected, fall through to local persistent JSON
    }

    // 2. Local persistent file storage
    let logs = readLocalLogs();

    if (action) logs = logs.filter((l) => l.action === action);
    if (actorRole) logs = logs.filter((l) => l.actorRole === actorRole);
    if (actorId) logs = logs.filter((l) => (l.actorId || "").toLowerCase().includes(actorId.toLowerCase()));
    if (targetEntity) logs = logs.filter((l) => l.targetEntity === targetEntity);
    if (targetId) logs = logs.filter((l) => (l.targetId || "").toLowerCase().includes(targetId.toLowerCase()));
    if (startDate) logs = logs.filter((l) => new Date(l.createdAt) >= new Date(startDate));
    if (endDate) logs = logs.filter((l) => new Date(l.createdAt) <= new Date(endDate));
    if (search) {
      logs = logs.filter((l) =>
        `${l.action} ${l.actorRole} ${l.targetEntity} ${l.targetId} ${l.ipAddress}`.toLowerCase().includes(search)
      );
    }

    // Sort newest first
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = logs.length;
    const offset = (page - 1) * limit;
    const paginated = logs.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}

/**
 * POST /api/admin/audit-logs
 * Record a new audit log
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLog = {
      id: body.id || crypto.randomUUID(),
      actorId: body.actorId || "system-admin",
      actorRole: body.actorRole || "ADMIN",
      action: body.action || "SYSTEM_EVENT",
      targetEntity: body.targetEntity || "System",
      targetId: body.targetId || "system",
      details: body.details || {},
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "MercatoX Platform",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // 1. Try Postgres
    try {
      const pool = getUsersDbPool();
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO audit_logs (id, "actorId", "actorRole", action, "targetEntity", "targetId", details, "ipAddress", "userAgent", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newLog.id,
            newLog.actorId,
            newLog.actorRole,
            newLog.action,
            newLog.targetEntity,
            newLog.targetId,
            JSON.stringify(newLog.details),
            newLog.ipAddress,
            newLog.userAgent,
            newLog.createdAt,
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Ignore postgres error and write local
    }

    // 2. Write to local file storage
    const logs = readLocalLogs();
    logs.unshift(newLog);
    writeLocalLogs(logs);

    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create audit log" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/audit-logs
 * Permanent deletion:
 * - { all: true } => Purge all audit logs permanently
 * - { ids: string[] } => Delete specific audit logs
 * - ?id=xyz => Delete single audit log
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const deleteAll = Boolean(body.all);
    const targetIds: string[] = body.ids || (body.id ? [body.id] : queryId ? [queryId] : []);

    if (!deleteAll && targetIds.length === 0) {
      return NextResponse.json(
        { error: "No target specified for deletion (provide 'all: true' or 'ids: [...]')" },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    // 1. Delete from PostgreSQL if available
    try {
      const pool = getUsersDbPool();
      const client = await pool.connect();
      try {
        if (deleteAll) {
          const res = await client.query(`DELETE FROM audit_logs`);
          deletedCount = res.rowCount ?? 0;
        } else {
          const res = await client.query(`DELETE FROM audit_logs WHERE id = ANY($1)`, [targetIds]);
          deletedCount = res.rowCount ?? 0;
        }
      } finally {
        client.release();
      }
    } catch {
      // Fall through to local file deletion
    }

    // 2. Delete from local persistent file storage
    let localLogs = readLocalLogs();
    if (deleteAll) {
      deletedCount = Math.max(deletedCount, localLogs.length);
      localLogs = [];
    } else {
      const beforeCount = localLogs.length;
      localLogs = localLogs.filter((l) => !targetIds.includes(l.id));
      deletedCount = Math.max(deletedCount, beforeCount - localLogs.length);
    }
    writeLocalLogs(localLogs);

    return NextResponse.json({
      success: true,
      message: deleteAll
        ? "All audit logs have been permanently deleted."
        : `Successfully deleted ${deletedCount} audit log(s) permanently.`,
      deletedCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete audit logs" }, { status: 500 });
  }
}
