import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "./PageContainer";

interface ComingSoonPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ComingSoonPage({ icon: Icon, title, description }: ComingSoonPageProps) {
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center text-center"
      >
        <div className="relative mb-6">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg">
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <Badge
          variant="secondary"
          className="mb-4 border-primary/20 bg-primary/10 text-primary hover:bg-primary/10"
        >
          Em desenvolvimento
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
          {description}
        </p>
        <p className="mt-6 text-xs text-muted-foreground/80">
          Esta funcionalidade estará disponível em breve.
        </p>
      </motion.div>
    </PageContainer>
  );
}
