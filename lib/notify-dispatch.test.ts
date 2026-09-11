import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/observe", () => ({ reportError: vi.fn() }));
import { sendEmail } from "@/lib/email";
import { reportError } from "@/lib/observe";
import { POST } from "@/app/api/notify/dispatch/route";

// The outbox in Postgres decides retry-or-give-up purely from this route's
// HTTP status. These pin that contract: 2xx sent, 400 dead at once, 401 and
// 5xx retried.
const SECRET = "unit-test-notify-secret";
const call = (body: unknown, secret = SECRET) =>
  POST(new Request("http://test/api/notify/dispatch", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-notify-secret": secret },
    body: JSON.stringify(body),
  }) as unknown as NextRequest);

const match = { kind: "match", payload: { freelancer_email: "specialist@example.com", title: "Logo", task_id: "t1" } };

describe("POST /api/notify/dispatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NOTIFY_SECRET = SECRET;
  });

  it("refuses a caller without the shared secret with 401, which the outbox retries", async () => {
    expect((await call(match, "wrong")).status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("answers 400 for an unknown kind, which the outbox drops at once", async () => {
    expect((await call({ kind: "nope", payload: {} })).status).toBe(400);
  });

  it("answers 400 for an unusable payload, which the outbox drops at once", async () => {
    expect((await call({ kind: "call_scheduled", payload: { scheduled_at: "not a date" } })).status).toBe(400);
  });

  it("answers 200 with nothing sent when there is no one to send to", async () => {
    const res = await call({ kind: "match", payload: { freelancer_email: "", title: "x" } });
    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("answers 502 and reports it when the email provider fails, so the outbox retries", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ ok: false, status: 500, error: "provider down" } as never);
    const res = await call({ ...match, outbox_id: 42 });
    expect(res.status).toBe(502);
    expect(reportError).toHaveBeenCalledWith("notify.dispatch", "provider down", expect.objectContaining({ kind: "match", outbox: "42" }));
  });

  it("answers 200 when the email is accepted, which settles the row as sent", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ ok: true, status: 202 } as never);
    expect((await call(match)).status).toBe(200);
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toMatchObject({ to: "specialist@example.com" });
  });

  it("turns an ops alert into an email to the admin", async () => {
    vi.mocked(sendEmail).mockResolvedValue({ ok: true, status: 202 } as never);
    const res = await call({ kind: "ops_alert", payload: { failed_kind: "match", attempts: 8, last_error: "HTTP 502", recipient: "x@example.com", outbox_id: 7 } });
    expect(res.status).toBe(200);
    const mail = vi.mocked(sendEmail).mock.calls[0][0];
    expect(mail.to).toBe(process.env.NOTIFY_ADMIN_EMAIL ?? "abdelrahman@hyrde.net");
    expect(mail.subject).toBe("A match could not be delivered");
    expect(mail.text).toContain("Last error: HTTP 502");
  });
});
