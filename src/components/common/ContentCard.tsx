import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ContentCard({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        "border-border/70 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {(title || action) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="min-w-0">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn(bodyClassName)}>{children}</CardContent>
    </Card>
  );
}
