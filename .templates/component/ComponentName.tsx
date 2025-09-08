import * as React from "react";
import { cn } from "@/lib/cn";

interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add your component props here
  children: React.ReactNode;
}

export function ComponentName({
  className,
  children,
  ...props
}: ComponentNameProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg bg-card text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
