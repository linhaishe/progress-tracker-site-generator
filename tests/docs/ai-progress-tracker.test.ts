import { afterEach, describe, expect, it, vi } from "vitest";
import { generateProgressTrackerFromDocs } from "../../src/docs/ai-progress-tracker.js";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("generateProgressTrackerFromDocs", () => {
  it("calls Gemini chat completions when AI_PROVIDER is gemini", async () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("AI_MODEL", "gemini-3.5-flash");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
        expect((init as RequestInit).headers).toMatchObject({
          Authorization: "Bearer gemini-key",
          "Content-Type": "application/json",
        });
        const body = JSON.parse(String((init as RequestInit).body));
        expect(body.model).toBe("gemini-3.5-flash");
        expect(body.messages[0].role).toBe("system");
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: "# Progress Tracker\n\n## Current Phase\n\n- Gemini AI",
                },
              },
            ],
          }),
          { status: 200 },
        );
      }),
    );

    await expect(
      generateProgressTrackerFromDocs({
        projectDocs: [{ relativePath: "docs/PRD.md", content: "# PRD" }],
        referenceDocs: [],
        progressSkeleton: "# Progress Tracker",
      }),
    ).resolves.toContain("Gemini AI");
  });

  it("calls Moonshot chat completions when AI_PROVIDER is moonshot", async () => {
    vi.stubEnv("AI_PROVIDER", "moonshot");
    vi.stubEnv("MOONSHOT_API_KEY", "moonshot-key");
    vi.stubEnv("AI_BASE_URL", "https://api.moonshot.cn/v1");
    vi.stubEnv("AI_MODEL", "kimi-k2.6");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url, init) => {
        expect(url).toBe("https://api.moonshot.cn/v1/chat/completions");
        expect((init as RequestInit).headers).toMatchObject({
          Authorization: "Bearer moonshot-key",
          "Content-Type": "application/json",
        });
        const body = JSON.parse(String((init as RequestInit).body));
        expect(body.model).toBe("kimi-k2.6");
        expect(body.messages[0].role).toBe("system");
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: "# Progress Tracker\n\n## Current Phase\n\n- Moonshot AI",
                },
              },
            ],
          }),
          { status: 200 },
        );
      }),
    );

    await expect(
      generateProgressTrackerFromDocs({
        projectDocs: [{ relativePath: "docs/PRD.md", content: "# PRD" }],
        referenceDocs: [],
        progressSkeleton: "# Progress Tracker",
      }),
    ).resolves.toContain("Moonshot AI");
  });

  it("uses a proxy dispatcher when HTTPS_PROXY is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("HTTPS_PROXY", "http://127.0.0.1:7890");

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        expect((init as { dispatcher?: unknown }).dispatcher).toBeDefined();
        return new Response(JSON.stringify({ output_text: "# Progress Tracker\n\n## Current Phase\n\n- AI" }), {
          status: 200,
        });
      }),
    );

    await expect(
      generateProgressTrackerFromDocs({
        projectDocs: [{ relativePath: "docs/PRD.md", content: "# PRD" }],
        referenceDocs: [],
        progressSkeleton: "# Progress Tracker",
      }),
    ).resolves.toContain("# Progress Tracker");
  });

  it("includes the low-level network cause when fetch fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed", {
          cause: Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" }),
        });
      }),
    );

    await expect(
      generateProgressTrackerFromDocs({
        projectDocs: [{ relativePath: "docs/PRD.md", content: "# PRD" }],
        referenceDocs: [],
        progressSkeleton: "# Progress Tracker",
      }),
    ).rejects.toThrow("ECONNRESET");
  });
});
