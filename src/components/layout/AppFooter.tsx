export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background/50 px-4 py-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} RadarCV AI. Todos os direitos reservados.</p>
        <p className="flex items-center gap-3">
          <span>v0.1 — Foundation</span>
          <span aria-hidden>·</span>
          <span>Feito com IA</span>
        </p>
      </div>
    </footer>
  );
}
