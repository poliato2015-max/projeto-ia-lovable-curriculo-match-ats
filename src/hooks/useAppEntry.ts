import { useAuth } from "@/hooks/useAuth";
import { APP_ENTRY_ROUTE } from "@/lib/navigation";

/**
 * Define para onde os CTAs públicos devem levar:
 * usuário autenticado entra na aplicação, visitante vai para o login.
 */
export function useAppEntryRoute(): typeof APP_ENTRY_ROUTE | "/auth" {
  const { session } = useAuth();
  return session ? APP_ENTRY_ROUTE : "/auth";
}
