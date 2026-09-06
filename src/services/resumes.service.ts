import { supabase } from "@/lib/supabase";
import { extractFileText } from "@/lib/file-text";
import type { Resume, ResumeKind } from "@/components/resumes/types";

const RESUMES_BUCKET = "resumes";

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  position: string | null;
  company: string | null;
  type: string;
  is_default: boolean;
  file_name: string | null;
  file_path: string | null;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
}

/** Converte o registro do banco para o modelo usado pela interface atual. */
export function mapRowToResume(row: ResumeRow): Resume {
  return {
    id: row.id,
    name: row.title,
    kind: (row.type === "ats" ? "ats" : "original") as ResumeKind,
    role: row.position ?? "—",
    area: "",
    language: "pt",
    updatedAt: row.updated_at,
    analyses: 0,
    atsVersions: 0,
    fileType: guessFileType(row.file_name),
    ...(row.company ? { company: row.company } : {}),
    favorite: row.is_default,
    ...(row.raw_text ? { rawText: row.raw_text } : {}),
    ...(row.file_path ? { filePath: row.file_path } : {}),
    ...(row.file_name ? { fileName: row.file_name } : {}),
  };
}

function guessFileType(fileName: string | null): Resume["fileType"] {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "docx" || ext === "txt" || ext === "md") return ext;
  return "pdf";
}

export async function listResumes(): Promise<Resume[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Não foi possível carregar seus currículos.");
  return (data as ResumeRow[]).map(mapRowToResume);
}

async function extractText(file: File): Promise<string | null> {
  try {
    const text = await extractFileText(file);
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Garante que temos o texto do currículo: usa o `raw_text` persistido e,
 * quando ausente, baixa o arquivo do Storage, extrai o conteúdo e atualiza o registro.
 */
export async function ensureResumeText(resume: Resume): Promise<string> {
  if (resume.rawText && resume.rawText.trim()) return resume.rawText;
  if (!resume.filePath) {
    throw new Error(
      "Este currículo não possui conteúdo legível. Reimporte o arquivo ou cole o texto.",
    );
  }

  const { data, error } = await supabase.storage.from(RESUMES_BUCKET).download(resume.filePath);
  if (error || !data) throw new Error("Não foi possível abrir o arquivo deste currículo.");

  const text = await extractFileText(data, resume.fileName ?? resume.filePath);
  if (!text.trim()) {
    throw new Error("Não conseguimos extrair o texto deste currículo. Cole o conteúdo manualmente.");
  }

  await supabase.from("resumes").update({ raw_text: text }).eq("id", resume.id);
  return text;
}


export interface ImportResumeInput {
  file: File;
  title?: string;
  position?: string;
  company?: string;
  type?: ResumeKind;
}

export async function importResume(input: ImportResumeInput): Promise<Resume> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const userId = userData.user.id;

  const safeName = input.file.name.replace(/[^\w.\-]+/g, "_");
  const filePath = `${userId}/${crypto.randomUUID()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(RESUMES_BUCKET)
    .upload(filePath, input.file, { upsert: false });
  if (uploadError) throw new Error("Falha ao enviar o arquivo. Tente novamente.");

  const rawText = await extractText(input.file);

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      title: input.title?.trim() || input.file.name.replace(/\.[^.]+$/, ""),
      position: input.position ?? null,
      company: input.company ?? null,
      type: input.type ?? "original",
      file_name: input.file.name,
      file_path: filePath,
      raw_text: rawText,
    })
    .select("*")
    .single();

  if (error) {
    await supabase.storage.from(RESUMES_BUCKET).remove([filePath]);
    throw new Error("Não foi possível salvar o currículo.");
  }

  return mapRowToResume(data as ResumeRow);
}

export interface UpdateResumeInput {
  title?: string;
  position?: string | null;
  company?: string | null;
  raw_text?: string | null;
}

export async function updateResume(id: string, input: UpdateResumeInput): Promise<Resume> {
  const { data, error } = await supabase
    .from("resumes")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error("Não foi possível atualizar o currículo.");
  return mapRowToResume(data as ResumeRow);
}

export async function setDefaultResume(id: string, isDefault = true): Promise<void> {
  const { error } = await supabase.from("resumes").update({ is_default: isDefault }).eq("id", id);
  if (error) throw new Error("Não foi possível definir o currículo padrão.");
}

export async function deleteResume(resume: Pick<Resume, "id" | "filePath">): Promise<void> {
  if (resume.filePath) {
    await supabase.storage.from(RESUMES_BUCKET).remove([resume.filePath]);
  }
  const { error } = await supabase.from("resumes").delete().eq("id", resume.id);
  if (error) throw new Error("Não foi possível excluir o currículo.");
}

export interface SaveAtsResumeInput {
  content: string;
  jobTitle: string;
  company: string;
  /** Currículo original que originou esta versão ATS. */
  sourceResumeId: string | null;
  /** Análise que originou esta versão ATS. */
  analysisId: string | null;
}

export interface SaveAtsResumeOutput {
  resume: Resume;
  version: number;
}

/**
 * Persiste o currículo ATS gerado: cria o registro na Biblioteca (tipo "ats")
 * e a versão correspondente em `ats_resumes`, vinculada ao currículo original
 * e à análise que a originou.
 */
export async function saveAtsResume(input: SaveAtsResumeInput): Promise<SaveAtsResumeOutput> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Sessão expirada. Entre novamente.");
  const userId = userData.user.id;

  const content = input.content.trim();
  if (!content) throw new Error("O currículo ATS está vazio.");

  const title = `Currículo ATS — ${input.jobTitle || "Vaga"}${
    input.company ? ` (${input.company})` : ""
  }`;

  const { data: created, error } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      title,
      position: input.jobTitle || null,
      company: input.company || null,
      type: "ats",
      raw_text: content,
    })
    .select("*")
    .single();

  if (error || !created) throw new Error("Não foi possível salvar o currículo ATS.");

  const resume = mapRowToResume(created as ResumeRow);

  let version = 1;
  const countQuery = supabase
    .from("ats_resumes")
    .select("id", { count: "exact", head: true });
  const { count } = input.analysisId
    ? await countQuery.eq("analysis_id", input.analysisId)
    : input.sourceResumeId
      ? await countQuery.eq("resume_id", input.sourceResumeId)
      : { count: 0 };
  version = (count ?? 0) + 1;

  await supabase.from("ats_resumes").insert({
    analysis_id: input.analysisId,
    resume_id: input.sourceResumeId ?? resume.id,
    content,
    version,
  });

  return { resume, version };
}

/**
 * Contexto de origem de um currículo ATS salvo na Biblioteca: a análise que o gerou
 * e o currículo original correspondente. Usa apenas as tabelas já existentes
 * (`ats_resumes`, `analyses`, `analysis_results`) — nenhuma tabela nova.
 */
export interface AtsOriginContext {
  analysisId: string | null;
  originalResumeId: string | null;
  jobTitle: string;
  company: string;
  jobDescription: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  /** Texto do currículo original — única fonte de verdade da nova versão. */
  originalText: string;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function loadAtsOrigin(resume: Resume): Promise<AtsOriginContext> {
  const content = await ensureResumeText(resume);

  const { data: versionRow } = await supabase
    .from("ats_resumes")
    .select("analysis_id, resume_id")
    .eq("content", content)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const analysisId = versionRow?.analysis_id ?? null;
  let originalResumeId = versionRow?.resume_id ?? null;
  if (originalResumeId === resume.id) originalResumeId = null;

  let jobTitle = resume.role === "—" ? "" : resume.role;
  let company = resume.company ?? "";
  let jobDescription = "";
  let keywordsFound: string[] = [];
  let keywordsMissing: string[] = [];

  if (analysisId) {
    const { data: analysis } = await supabase
      .from("analyses")
      .select("job_title, company, job_description, resume_id")
      .eq("id", analysisId)
      .maybeSingle();

    if (analysis) {
      jobTitle = analysis.job_title || jobTitle;
      company = analysis.company || company;
      jobDescription = analysis.job_description ?? "";
      originalResumeId = analysis.resume_id ?? originalResumeId;
    }

    const { data: results } = await supabase
      .from("analysis_results")
      .select("keywords_found, keywords_missing")
      .eq("analysis_id", analysisId)
      .maybeSingle();

    keywordsFound = stringList(results?.keywords_found);
    keywordsMissing = stringList(results?.keywords_missing);
  }

  let originalText = "";
  if (originalResumeId) {
    const { data: original } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", originalResumeId)
      .maybeSingle();
    if (original) originalText = await ensureResumeText(mapRowToResume(original as ResumeRow));
  }

  if (!originalText.trim()) {
    throw new Error(
      "Não encontramos o currículo original desta versão ATS para gerar uma nova versão.",
    );
  }

  return {
    analysisId,
    originalResumeId,
    jobTitle,
    company,
    jobDescription,
    keywordsFound,
    keywordsMissing,
    originalText,
  };
}

/**
 * Atualiza o conteúdo textual de um currículo. Para versões ATS, mantém a versão
 * registrada em `ats_resumes` sincronizada, preservando a associação com a análise
 * e com o currículo original.
 */
export async function updateResumeContent(
  resume: Resume,
  content: string,
): Promise<Resume> {
  const text = content.trim();
  if (!text) throw new Error("O conteúdo do currículo não pode ficar vazio.");

  if (resume.kind === "ats" && resume.rawText?.trim()) {
    await supabase
      .from("ats_resumes")
      .update({ content: text })
      .eq("content", resume.rawText.trim());
  }

  return updateResume(resume.id, { raw_text: text });
}
