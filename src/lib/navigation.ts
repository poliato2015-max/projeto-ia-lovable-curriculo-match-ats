/**
 * Ponto único de entrada da aplicação a partir da Landing Page.
 * Nesta Sprint a navegação é mockada e aponta para o Dashboard.
 */
export const APP_ENTRY_ROUTE = "/dashboard" as const;

export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
