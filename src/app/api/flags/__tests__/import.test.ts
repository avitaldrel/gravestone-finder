import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FlagInsert } from "@/lib/types/flag";

// --- Supabase mock ---

// Track calls for assertions
let mockCalls: {
  from: string;
  method: string;
  args: unknown[];
}[] = [];

// Configurable mock responses
let mockSelectResponse: { data: unknown[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};
let mockInsertResponse: { data: unknown[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};
let mockDeleteResponse: { data: null; error: { message: string } | null } = {
  data: null,
  error: null,
};
let mockUpsertResponse: { data: unknown[] | null; error: { message: string } | null } = {
  data: [],
  error: null,
};

function createChainableMock(tableName: string) {
  return {
    select: (...args: unknown[]) => {
      mockCalls.push({ from: tableName, method: "select", args });
      return {
        order: (...orderArgs: unknown[]) => {
          mockCalls.push({ from: tableName, method: "order", args: orderArgs });
          return Promise.resolve(mockSelectResponse);
        },
      };
    },
    insert: (...args: unknown[]) => {
      mockCalls.push({ from: tableName, method: "insert", args });
      return {
        select: () => {
          mockCalls.push({ from: tableName, method: "insert.select", args: [] });
          return Promise.resolve(mockInsertResponse);
        },
      };
    },
    delete: () => {
      mockCalls.push({ from: tableName, method: "delete", args: [] });
      return {
        gte: (...gteArgs: unknown[]) => {
          mockCalls.push({ from: tableName, method: "delete.gte", args: gteArgs });
          return Promise.resolve(mockDeleteResponse);
        },
      };
    },
    upsert: (...args: unknown[]) => {
      mockCalls.push({ from: tableName, method: "upsert", args });
      return {
        select: () => {
          mockCalls.push({ from: tableName, method: "upsert.select", args: [] });
          return Promise.resolve(mockUpsertResponse);
        },
      };
    },
  };
}

const mockSupabaseClient = {
  from: (table: string) => {
    mockCalls.push({ from: table, method: "from", args: [table] });
    return createChainableMock(table);
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

// --- Import handlers after mocking ---

// Dynamic import so mock is in place
const { POST, GET, DELETE: DELETE_HANDLER } = await import(
  "@/app/api/flags/import/route"
);

// --- Test helpers ---

function createRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost:3000/api/flags/import", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const sampleFlags: FlagInsert[] = [
  { name: "John Smith", row_label: "A", position: 1 },
  { name: "Jane Doe", row_label: "A", position: 2 },
  { name: "Robert Johnson", row_label: "B", position: 1 },
];

// --- Tests ---

describe("POST /api/flags/import", () => {
  beforeEach(() => {
    mockCalls = [];
    mockSelectResponse = { data: [], error: null };
    mockInsertResponse = { data: [], error: null };
    mockDeleteResponse = { data: null, error: null };
    mockUpsertResponse = { data: [], error: null };
  });

  it("replace mode with empty DB inserts all flags and returns correct count", async () => {
    mockInsertResponse = {
      data: sampleFlags.map((f, i) => ({
        ...f,
        id: i + 1,
        created_at: new Date().toISOString(),
      })),
      error: null,
    };

    const request = createRequest({ flags: sampleFlags, mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(3);

    // Verify delete was called first, then insert
    const deleteCall = mockCalls.find((c) => c.method === "delete.gte");
    const insertCall = mockCalls.find((c) => c.method === "insert");

    expect(deleteCall).toBeDefined();
    expect(deleteCall!.args).toEqual(["id", 0]);
    expect(insertCall).toBeDefined();
    expect(insertCall!.args[0]).toEqual(sampleFlags);
  });

  it("replace mode when DB has existing data deletes old data and inserts new", async () => {
    // Mock successful delete and insert
    mockDeleteResponse = { data: null, error: null };
    mockInsertResponse = {
      data: sampleFlags.map((f, i) => ({
        ...f,
        id: i + 10,
        created_at: new Date().toISOString(),
      })),
      error: null,
    };

    const request = createRequest({ flags: sampleFlags, mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(3);

    // Verify delete called with correct filter
    const deleteCalls = mockCalls.filter((c) => c.method === "delete.gte");
    expect(deleteCalls).toHaveLength(1);
    expect(deleteCalls[0].args).toEqual(["id", 0]);
  });

  it("merge mode upserts flags by row_label+position", async () => {
    mockUpsertResponse = {
      data: sampleFlags.map((f, i) => ({
        ...f,
        id: i + 1,
        created_at: new Date().toISOString(),
      })),
      error: null,
    };

    const request = createRequest({ flags: sampleFlags, mode: "merge" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(3);

    // Verify upsert was called with correct onConflict
    const upsertCall = mockCalls.find((c) => c.method === "upsert");
    expect(upsertCall).toBeDefined();
    expect(upsertCall!.args[0]).toEqual(sampleFlags);
    expect(upsertCall!.args[1]).toEqual({
      onConflict: "row_label,position",
    });
  });

  it("returns 400 for invalid mode", async () => {
    const request = createRequest({
      flags: sampleFlags,
      mode: "invalid",
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("mode");
  });

  it("returns count 0 for empty flags array with replace mode", async () => {
    const request = createRequest({ flags: [], mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(0);
  });

  it("returns count 0 for empty flags array with merge mode", async () => {
    const request = createRequest({ flags: [], mode: "merge" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.count).toBe(0);
  });

  it("returns 400 when flags is not an array", async () => {
    const request = createRequest({ flags: "not-an-array", mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("array");
  });

  it("returns 500 when replace delete fails", async () => {
    mockDeleteResponse = {
      data: null,
      error: { message: "DB connection error" },
    };

    const request = createRequest({ flags: sampleFlags, mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to clear existing data");
  });

  it("returns 500 when insert fails", async () => {
    mockDeleteResponse = { data: null, error: null };
    mockInsertResponse = {
      data: null,
      error: { message: "Insert failed" },
    };

    const request = createRequest({ flags: sampleFlags, mode: "replace" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Insert failed");
  });

  it("returns 500 when upsert fails", async () => {
    mockUpsertResponse = {
      data: null,
      error: { message: "Upsert failed" },
    };

    const request = createRequest({ flags: sampleFlags, mode: "merge" });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Upsert failed");
  });
});

describe("GET /api/flags/import", () => {
  beforeEach(() => {
    mockCalls = [];
    mockSelectResponse = { data: [], error: null };
  });

  it("returns all flags sorted by name", async () => {
    const flagsData = [
      { id: 1, name: "Adams, John", row_label: "A", position: 3, created_at: "2026-01-01" },
      { id: 2, name: "Baker, Mary", row_label: "B", position: 1, created_at: "2026-01-01" },
    ];
    mockSelectResponse = { data: flagsData, error: null };

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(flagsData);

    // Verify select and order were called
    const selectCall = mockCalls.find((c) => c.method === "select");
    const orderCall = mockCalls.find((c) => c.method === "order");
    expect(selectCall).toBeDefined();
    expect(selectCall!.args[0]).toBe("*");
    expect(orderCall).toBeDefined();
    expect(orderCall!.args[0]).toBe("name");
  });

  it("returns 500 when select fails", async () => {
    mockSelectResponse = {
      data: null,
      error: { message: "Connection error" },
    };

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Connection error");
  });
});

describe("DELETE /api/flags/import", () => {
  beforeEach(() => {
    mockCalls = [];
    mockDeleteResponse = { data: null, error: null };
  });

  it("clears all flags and returns success", async () => {
    const response = await DELETE_HANDLER();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    // Verify delete was called with correct filter
    const deleteCall = mockCalls.find((c) => c.method === "delete.gte");
    expect(deleteCall).toBeDefined();
    expect(deleteCall!.args).toEqual(["id", 0]);
  });

  it("returns 500 when delete fails", async () => {
    mockDeleteResponse = {
      data: null,
      error: { message: "Delete failed" },
    };

    const response = await DELETE_HANDLER();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Delete failed");
  });
});
