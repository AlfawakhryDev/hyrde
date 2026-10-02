import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/observe", () => ({ reportError: vi.fn() }));
import { reportError } from "@/lib/observe";
import { transcribeAnswer } from "./asr";

const clip = () => new File([new Uint8Array([1, 2, 3])], "answer.webm", { type: "audio/webm" });
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);
const answers = (body: unknown, ok = true, status = 200) =>
  fetchMock.mockResolvedValue({ ok, status, json: async () => body, text: async () => JSON.stringify(body) });

describe("transcribeAnswer", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    delete process.env.ASR_URL; delete process.env.ASR_KEY;
    delete process.env.ASR_MODEL; delete process.env.ELEVENLABS_API_KEY;
  });

  it("stays out of the way when no provider is configured", async () => {
    expect(await transcribeAnswer(clip(), "ar")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("prefers a self-hosted endpoint and tells it the language", async () => {
    process.env.ASR_URL = "https://asr.internal/v1/audio/transcriptions";
    process.env.ASR_KEY = "k";
    answers({ text: "  أنا مهندس برمجيات  " });
    expect(await transcribeAnswer(clip(), "ar")).toEqual({ text: "أنا مهندس برمجيات", provider: "asr-url" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://asr.internal/v1/audio/transcriptions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer k");
    expect((init.body as FormData).get("language")).toBe("ar");
    expect((init.body as FormData).get("model")).toBe("audar-asr-v1-turbo");
  });

  it("falls back to ElevenLabs when no endpoint is set", async () => {
    process.env.ELEVENLABS_API_KEY = "eleven";
    answers({ text: "I rebuilt their checkout flow" });
    expect(await transcribeAnswer(clip(), "en")).toEqual({ text: "I rebuilt their checkout flow", provider: "elevenlabs" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.elevenlabs.io/v1/speech-to-text");
    expect((init.headers as Record<string, string>)["xi-api-key"]).toBe("eleven");
    expect((init.body as FormData).get("language_code")).toBe("en");
  });

  it("reports a provider failure and lets the browser transcript stand", async () => {
    process.env.ELEVENLABS_API_KEY = "eleven";
    answers({ error: "nope" }, false, 500);
    expect(await transcribeAnswer(clip(), "ar")).toBeNull();
    expect(reportError).toHaveBeenCalledWith("asr", expect.any(Error), { provider: "elevenlabs" });
  });

  it("retries with the older Scribe model when the account can't use the newer one", async () => {
    process.env.ELEVENLABS_API_KEY = "eleven";
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 422, json: async () => ({}), text: async () => "unknown model_id" })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ text: "second time lucky" }), text: async () => "" });
    expect(await transcribeAnswer(clip(), "ar")).toEqual({ text: "second time lucky", provider: "elevenlabs" });
    expect((fetchMock.mock.calls[0][1].body as FormData).get("model_id")).toBe("scribe_v2");
    expect((fetchMock.mock.calls[1][1].body as FormData).get("model_id")).toBe("scribe_v1");
  });

  it("treats an empty transcript as nothing heard", async () => {
    process.env.ELEVENLABS_API_KEY = "eleven";
    answers({ text: "   " });
    expect(await transcribeAnswer(clip(), "ar")).toBeNull();
  });

  it("never throws when the network does", async () => {
    process.env.ELEVENLABS_API_KEY = "eleven";
    fetchMock.mockRejectedValue(new Error("network"));
    expect(await transcribeAnswer(clip(), "ar")).toBeNull();
  });
});
