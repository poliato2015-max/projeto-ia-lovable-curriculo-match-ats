/**
 * Ponto único de acesso ao cliente do backend (Lovable Cloud).
 * O cliente é gerado automaticamente em src/integrations/supabase/client.ts.
 */
export { supabase } from "@/integrations/supabase/client";
export type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
