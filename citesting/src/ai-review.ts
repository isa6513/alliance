import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "fs";
import path from "path";

const logPrefix = "[citesting:ai-review]";

type ReviewResult = {
  page: string;
  status: "pass" | "fail";
  reason: string;
};

const toBase64 = async (filePath: string): Promise<string> => {
  const buf = await fs.readFile(filePath);
  return buf.toString("base64");
};

const fileExists = async (p: string): Promise<boolean> => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const [baselineDir, currentDir, diffDir] = process.argv.slice(2);

  if (!baselineDir || !currentDir || !diffDir) {
    console.error(
      `Usage: ts-node ai-review.ts <baselineDir> <currentDir> <diffDir>`
    );
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error(`${logPrefix} ANTHROPIC_API_KEY is not set`);
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  const currentFiles = (await fs.readdir(currentDir)).filter((f) =>
    f.endsWith(".png")
  );

  if (currentFiles.length === 0) {
    console.log(`${logPrefix} No screenshots to review.`);
    process.exit(0);
  }

  const results: ReviewResult[] = [];

  for (const file of currentFiles) {
    const pageName = file.replace(/\.png$/, "");
    const baselinePath = path.join(baselineDir, file);
    const diffPath = path.join(diffDir, file);

    const hasBaseline = await fileExists(baselinePath);
    const hasDiff = await fileExists(diffPath);

    // No baseline = new page → auto-pass
    if (!hasBaseline) {
      console.log(`${logPrefix} [PASS] ${pageName} — new page, no baseline`);
      results.push({ page: pageName, status: "pass", reason: "New page, no baseline to compare" });
      continue;
    }

    // No diff file = unchanged → auto-pass
    if (!hasDiff) {
      console.log(`${logPrefix} [PASS] ${pageName} — unchanged`);
      results.push({ page: pageName, status: "pass", reason: "No visual changes detected" });
      continue;
    }

    // Has diff → send to Claude for review
    console.log(`${logPrefix} Reviewing ${pageName} with Claude...`);

    const [baselineB64, currentB64, diffB64] = await Promise.all([
      toBase64(baselinePath),
      toBase64(path.join(currentDir, file)),
      toBase64(diffPath),
    ]);

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      tools: [
        {
          name: "report_review",
          description:
            "Report the visual regression review result for a page.",
          input_schema: {
            type: "object" as const,
            properties: {
              page: {
                type: "string",
                description: "The page name being reviewed",
              },
              status: {
                type: "string",
                enum: ["pass", "fail"],
                description:
                  "pass if the changes are acceptable (minor/expected), fail if there is a visual regression",
              },
              reason: {
                type: "string",
                description:
                  "Brief explanation of what changed and why it passes or fails",
              },
            },
            required: ["page", "status", "reason"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "report_review" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a visual regression tester. Compare these screenshots of the "${pageName}" page.

The first image is the BASELINE (previous known-good version).
The second image is the CURRENT build.
The third image is the PIXEL DIFF (red highlights show changed pixels).

Decide whether the visual changes represent a regression (broken layout, missing elements, overlapping text, broken styling) or are acceptable (minor rendering differences, anti-aliasing, expected content changes).

Report "pass" for acceptable changes and "fail" for regressions.`,
            },
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: baselineB64 },
            },
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: currentB64 },
            },
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: diffB64 },
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
      const input = toolUse.input as ReviewResult;
      const result: ReviewResult = {
        page: input.page || pageName,
        status: input.status,
        reason: input.reason,
      };
      results.push(result);
      const icon = result.status === "pass" ? "PASS" : "FAIL";
      console.log(
        `${logPrefix} [${icon}] ${result.page} — ${result.reason}`
      );
    } else {
      console.error(
        `${logPrefix} [ERROR] ${pageName} — unexpected response format`
      );
      results.push({
        page: pageName,
        status: "fail",
        reason: "Unexpected API response format",
      });
    }
  }

  // Summary
  const failures = results.filter((r) => r.status === "fail");
  console.log(
    `\n${logPrefix} === Summary: ${results.length - failures.length} passed, ${failures.length} failed ===`
  );

  if (failures.length > 0) {
    console.log(`${logPrefix} Failed pages:`);
    for (const f of failures) {
      console.log(`${logPrefix}   - ${f.page}: ${f.reason}`);
    }
    process.exit(1);
  }

  process.exit(0);
};

void main();
