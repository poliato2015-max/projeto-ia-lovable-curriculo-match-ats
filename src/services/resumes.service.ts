import { supabase } from "@/lib/supabase";
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
