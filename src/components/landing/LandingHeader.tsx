import { Link } from "@tanstack/react-router";
import { Radar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/navigation";
import { useAppEntryRoute } from "@/hooks/useAppEntry";


const menu = [
  { label: "Como funciona", id: "como-funciona" },
  { label: "Funcionalidades", id: "funcionalidades" },
  { label: "Sobre o Projeto", id: "sobre" },
];

export function LandingHeader() {
  const entryRoute = useAppEntryRoute();
  return (

    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
            <Radar className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">RadarCV</span>
        </div>

        <nav className="mx-auto hidden items-center gap-1 md:flex">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto md:ml-0">
          <Button asChild size="sm" className="gap-1.5">
            <Link to={entryRoute}>
              Analisar uma vaga
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
