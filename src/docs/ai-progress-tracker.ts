import { ProxyAgent } from "undici";
import type { ProjectDoc } from "./project-docs.js";

export type GenerateProgressTrackerInput = {
  projectDocs: ProjectDoc[];
  referenceDocs: ProjectDoc[];
  progressSkeleton: string;
};

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

type ChatCompletionsApiResult = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type AiProvider = "openai" | "moonshot" | "gemini";

type FetchOptions = RequestInit & {
  dispatcher?: ProxyAgent;
};

function formatDocs(docs: ProjectDoc[]) {
  if (docs.length === 0) return "No documents supplied.";
  return docs.map((doc) => `--- ${doc.relativePath} ---\n${doc.content.trim()}`).join("\n\n");
}

function extractOutputText(result: ResponsesApiResult) {
  if (result.output_text) return result.output_text;
  return (
    result.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function extractChatCompletionText(result: ChatCompletionsApiResult) {
  return result.choices?.[0]?.message?.content ?? "";
}

function assertProgressTracker(markdown: string) {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith("# Progress Tracker")) {
    throw new Error("AI output did not start with # Progress Tracker");
  }
  return `${trimmed}\n`;
}

function proxyUrlFromEnv() {
  return process.env.HTTPS_PROXY ?? process.env.https_proxy ?? process.env.ALL_PROXY ?? process.env.all_proxy;
}

function formatNetworkError(error: unknown) {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause;
  if (cause instanceof Error) {
    const code = "code" in cause && typeof cause.code === "string" ? `${cause.code} ` : "";
    return `${error.message} (${code}${cause.message})`;
  }
  return error.message;
}

function providerFromEnv(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (provider === "gemini") return "gemini";
  if (provider === "moonshot") return "moonshot";
  if (provider === "openai") return "openai";
  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

function apiKeyForProvider(provider: AiProvider) {
  if (provider === "moonshot") {
    const apiKey = process.env.MOONSHOT_API_KEY ?? process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("MOONSHOT_API_KEY is not set");
    return apiKey;
  }
  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    return apiKey;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return apiKey;
}

function modelForProvider(provider: AiProvider) {
  if (process.env.AI_MODEL) return process.env.AI_MODEL;
  if (provider === "gemini") return "gemini-2.5-flash";
  if (provider === "moonshot") return "kimi-k2.6";
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

function baseUrlForProvider(provider: AiProvider) {
  if (process.env.AI_BASE_URL) return process.env.AI_BASE_URL.replace(/\/$/, "");
  if (provider === "gemini") return "https://generativelanguage.googleapis.com/v1beta/openai";
  if (provider === "moonshot") return "https://api.moonshot.ai/v1";
  return "https://api.openai.com/v1";
}

function fetchOptions(body: unknown, apiKey: string): FetchOptions {
  const options: FetchOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
  const proxyUrl = proxyUrlFromEnv();
  if (proxyUrl) {
    options.dispatcher = new ProxyAgent(proxyUrl);
  }
  return options;
}

function trackerPrompt(input: GenerateProgressTrackerInput) {
  return `Create a complete progress tracker using the exact section structure from the skeleton.

Use the target project docs as the factual source. Use packaged reference docs only for style, stage vocabulary, and expectations. Synthesize the current phase, goal, next workflow, next steps, risks, assumptions, architecture decisions, session notes, and verification notes. Do not paste full source documents into the tracker.

Keep the markdown human-readable, but preserve stable machine-readable section names and labels from the skeleton. In particular, keep Project Health, Active Slice, Exit Criteria, Next Up, Next Slices, Source Map, and Verification. Use stable labels such as Delivery Confidence, Scope Stability, Technical Risk, Blocker Status, Name, Status, Owner, Source, Started, Target, Last Run, Result, Checked At, and Coverage.

Track delivery slices and exit criteria, not tiny implementation TODOs. Completed should contain only recent key delivery slices. Open Questions and Risks must stay separate. Source Map should point to source documents instead of copying their content.

Progress tracker skeleton:
${input.progressSkeleton}

Packaged reference docs:
${formatDocs(input.referenceDocs)}

Target project docs:
${formatDocs(input.projectDocs)}`;
}

function systemPrompt() {
  return "You generate concise project progress tracker markdown for developer handoff dashboards. Return only markdown. Do not include commentary, code fences, or copied source documents.";
}

export async function generateProgressTrackerFromDocs(input: GenerateProgressTrackerInput): Promise<string> {
  const provider = providerFromEnv();
  const apiKey = apiKeyForProvider(provider);
  const model = modelForProvider(provider);
  const baseUrl = baseUrlForProvider(provider);
  const usesChatCompletions = provider === "moonshot" || provider === "gemini";
  const path = usesChatCompletions ? "/chat/completions" : "/responses";
  const body =
    usesChatCompletions
      ? {
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt(),
            },
            {
              role: "user",
              content: trackerPrompt(input),
            },
          ],
        }
      : {
          model,
          input: [
            {
              role: "system",
              content: systemPrompt(),
            },
            {
              role: "user",
              content: trackerPrompt(input),
            },
          ],
        };
  let response: Response;
  try {
    response = await fetch(
      `${baseUrl}${path}`,
      fetchOptions(body, apiKey),
    );
  } catch (error) {
    throw new Error(`${provider} request failed before response: ${formatNetworkError(error)}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider} request failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  const markdown =
    usesChatCompletions
      ? extractChatCompletionText(result as ChatCompletionsApiResult)
      : extractOutputText(result as ResponsesApiResult);
  return assertProgressTracker(markdown);
}
