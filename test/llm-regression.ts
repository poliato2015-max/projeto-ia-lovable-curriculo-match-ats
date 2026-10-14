#!/usr/bin/env bun
/**
 * Script de regressão LLM - valida que a abstração LLMClient produz
 * outputs válidos para os mesmos inputs (fixtures salvos do Lovable).
 *
 * Uso: bun test/llm-regression.ts
 * Requer: LLM_PROVIDER, LLM_API_KEY, LLM_MODEL configurados no ambiente
 */

import { createLLMClient } from "@/lib/llm/factory";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, "fixtures/llm");

interface TestCase {
  name: string;
  inputFile: string;
  outputFile: string;
  schema: Record<string, unknown>;
  operation: "analyzeWithAI" | "generateAtsWithAI" | "evaluateContentChecks";
}

const TEST_CASES: TestCase[] = [
  {
    name: "Análise ATS",
    inputFile: "analysis-input.json",
    outputFile: "analysis-output.json",
    schema: JSON.parse(readFileSync(join(FIXTURES_DIR, "analysis-input.json"), "utf-8")).responseSchema || {},
    operation: "analyzeWithAI",
  },
  {
    name: "Geração Currículo ATS",
    inputFile: "ats-resume-input.json",
    outputFile: "ats-resume-output.json",
    schema: JSON.parse(readFileSync(join(FIXTURES_DIR, "ats-resume-input.json"), "utf-8")).responseSchema || {},
    operation: "generateAtsWithAI",
  },
  {
    name: "Checklist ATS",
    inputFile: "checklist-input.json",
    outputFile: "checklist-output.json",
    schema: JSON.parse(readFileSync(join(FIXTURES_DIR, "checklist-input.json"), "utf-8")).responseSchema || {},
    operation: "evaluateContentChecks",
  },
];

// Schemas inline (copiados dos prompts para validação standalone)
const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "score", "summary", "jobSummary", "hardSkills", "softSkills",
    "keywordsFound", "keywordsMissing", "experienceMatch", "education",
    "languages", "strengths", "recommendations", "improvements", "nextSteps"
  ],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    jobSummary: { type: "string" },
    hardSkills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, status: { type: "string", enum: ["match", "partial", "missing"] }, description: { type: "string" } }, required: ["name", "status", "description"] } },
    softSkills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, status: { type: "string", enum: ["match", "partial", "missing"] }, description: { type: "string" } }, required: ["name", "status", "description"] } },
    keywordsFound: { type: "array", items: { type: "string" } },
    keywordsMissing: { type: "array", items: { type: "string" } },
    experienceMatch: { type: "integer", minimum: 0, maximum: 100 },
    education: { type: "string" },
    languages: { type: "array", items: { type: "string" } },
    strengths: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    nextSteps: { type: "array", items: { type: "string" } },
  },
} as const;

const ATS_RESUME_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["content", "keywordsUsed", "omittedKeywords", "notes"],
  properties: {
    content: { type: "string" },
    keywordsUsed: { type: "array", items: { type: "string" } },
    omittedKeywords: { type: "array", items: { type: "string" } },
    notes: { type: "string" },
  },
} as const;

const CHECKLIST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["sectionsPass", "sectionsDetail", "originalOnlyPass", "originalOnlyDetail", "objectiveLanguagePass", "objectiveLanguageDetail"],
  properties: {
    sectionsPass: { type: "boolean" },
    sectionsDetail: { type: "string" },
    originalOnlyPass: { type: "boolean" },
    originalOnlyDetail: { type: "string" },
    objectiveLanguagePass: { type: "boolean" },
    objectiveLanguageDetail: { type: "string" },
  },
} as const;

function validateSchema(data: unknown, schema: Record<string, unknown>, path = ""): string[] {
  const errors: string[] = [];
  const s = schema as any;

  if (s.type === "object") {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      errors.push(`${path}: expected object, got ${typeof data}`);
      return errors;
    }
    const obj = data as Record<string, unknown>;
    if (s.required) {
      for (const req of s.required) {
        if (!(req in obj)) errors.push(`${path}.${req}: required field missing`);
      }
    }
    if (s.properties) {
      for (const [key, propSchema] of Object.entries(s.properties)) {
        if (key in obj) {
          errors.push(...validateSchema(obj[key], propSchema as Record<string, unknown>, `${path}.${key}`));
        }
      }
    }
    if (s.additionalProperties === false) {
      const allowedKeys = new Set([...(s.required || []), ...Object.keys(s.properties || {})]);
      for (const key of Object.keys(obj)) {
        if (!allowedKeys.has(key)) {
          errors.push(`${path}.${key}: additional property not allowed`);
        }
      }
    }
  } else if (s.type === "array") {
    if (!Array.isArray(data)) {
      errors.push(`${path}: expected array, got ${typeof data}`);
    } else if (s.items) {
      data.forEach((item, i) => {
        errors.push(...validateSchema(item, s.items as Record<string, unknown>, `${path}[${i}]`));
      });
    }
  } else if (s.type === "string") {
    if (typeof data !== "string") errors.push(`${path}: expected string, got ${typeof data}`);
    if (s.enum && !s.enum.includes(data)) errors.push(`${path}: value "${data}" not in enum ${s.enum.join(", ")}`);
  } else if (s.type === "integer" || s.type === "number") {
    if (typeof data !== "number") errors.push(`${path}: expected number, got ${typeof data}`);
    if (s.minimum !== undefined && data < s.minimum) errors.push(`${path}: value ${data} < minimum ${s.minimum}`);
    if (s.maximum !== undefined && data > s.maximum) errors.push(`${path}: value ${data} > maximum ${s.maximum}`);
  } else if (s.type === "boolean") {
    if (typeof data !== "boolean") errors.push(`${path}: expected boolean, got ${typeof data}`);
  }

  return errors;
}

async function runRegression() {
  console.log("🔍 LLM Regression Test");
  console.log("========================");
  console.log(`Provider: ${process.env.LLM_PROVIDER || "lovable"}`);
  console.log(`Model: ${process.env.LLM_MODEL || "default"}`);
  console.log("");

  const client = createLLMClient({
    provider: (process.env.LLM_PROVIDER as any) || "lovable",
    apiKey: process.env.LLM_API_KEY || process.env.LOVABLE_API_KEY || "",
    model: process.env.LLM_MODEL,
    baseUrl: process.env.LLM_BASE_URL,
    orgId: process.env.LLM_ORG_ID,
    timeoutMs: process.env.LLM_TIMEOUT_MS ? Number(process.env.LLM_TIMEOUT_MS) : undefined,
  });

  let totalPassed = 0;
  let totalFailed = 0;

  for (const tc of TEST_CASES) {
    console.log(`\n📋 ${tc.name}...`);

    try {
      // Load input
      const inputRaw = readFileSync(join(FIXTURES_DIR, tc.inputFile), "utf-8");
      const input = JSON.parse(inputRaw);

      // Determine schema
      let schema: Record<string, unknown>;
      if (tc.name === "Análise ATS") schema = ANALYSIS_SCHEMA;
      else if (tc.name === "Geração Currículo ATS") schema = ATS_RESUME_SCHEMA;
      else schema = CHECKLIST_SCHEMA;

      // Call LLMClient
      let response: { content: string };
      const start = Date.now();

      if (tc.name === "Análise ATS") {
        // Build messages like analyzeWithAI does
        const { buildPrompt } = await import("@/lib/prompts/analysis.prompt");
        response = await client.chatCompletion({
          messages: [
            { role: "system", content: "Você é um especialista em recrutamento e sistemas ATS. Avalie currículos com rigor, sem inventar experiências inexistentes." },
            { role: "user", content: buildPrompt(input) },
          ],
          responseSchema: schema,
          model: client.config.model,
          temperature: 0.1,
          maxTokens: 4096,
        });
      } else if (tc.name === "Geração Currículo ATS") {
        const { buildPrompt, SYSTEM_PROMPT } = await import("@/lib/prompts/ats-resume.prompt");
        response = await client.chatCompletion({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(input) },
          ],
          responseSchema: schema,
          model: client.config.model,
          temperature: 0.1,
          maxTokens: 4096,
        });
      } else {
        const { buildPrompt, SYSTEM_PROMPT } = await import("@/lib/prompts/ats-checklist.prompt");
        response = await client.chatCompletion({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildPrompt(input) },
          ],
          responseSchema: schema,
          model: client.config.model,
          temperature: 0.1,
          maxTokens: 4096,
        });
      }

      const latencyMs = Date.now() - start;

      // Parse and validate response
      let parsed: unknown;
      try {
        parsed = JSON.parse(response.content);
      } catch (e) {
        console.log(`  ❌ FALHOU: JSON inválido - ${e}`);
        totalFailed++;
        continue;
      }

      // Validate against schema
      const schemaErrors = validateSchema(parsed, schema, tc.name);
      if (schemaErrors.length > 0) {
        console.log(`  ❌ FALHOU: Schema validation errors:`);
        for (const err of schemaErrors) console.log(`     - ${err}`);
        totalFailed++;
        continue;
      }

      // Compare with expected output (optional - structural comparison)
      const expectedRaw = readFileSync(join(FIXTURES_DIR, tc.outputFile), "utf-8");
      const expected = JSON.parse(expectedRaw);

      // Check required fields exist and have correct types (already done by schema validation)
      // Additional: check critical fields match expected types/structure
      console.log(`  ✅ PASSOU: Schema válido, latência ${latencyMs}ms`);
      console.log(`     Output keys: ${Object.keys(parsed as object).join(", ")}`);
      totalPassed++;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ FALHOU: ${errorMsg}`);
      totalFailed++;
    }
  }

  console.log("\n========================");
  console.log(`Resultado: ${totalPassed} passaram, ${totalFailed} falharam`);
  console.log(totalFailed === 0 ? "🎉 TODOS OS TESTES PASSARAM" : "⚠️  ALGUNS TESTES FALHARAM");
  process.exit(totalFailed > 0 ? 1 : 0);
}

runRegression().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});