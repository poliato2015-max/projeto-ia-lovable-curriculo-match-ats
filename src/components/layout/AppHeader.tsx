import { Bell, LogOut, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initials = (user?.email ?? "RC").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOut();
      navigate({ to: "/", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível sair.");
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 hidden h-6 sm:block" />

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar no RadarCV..."
          aria-label="Buscar"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-secondary" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Conta" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
              {user?.email ?? "Minha conta"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
