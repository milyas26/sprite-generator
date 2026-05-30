"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Library, PlusCircle } from "lucide-react";
import { ProcessJobsButton } from "@/features/generation/components/process-jobs-button";

const navItems = [
  { href: "/dashboard", label: "Library", icon: Library },
  { href: "/dashboard/characters/new", label: "New Character", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-12 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/15 ring-1 ring-primary/20 flex-shrink-0">
          <span className="text-primary text-[10px] font-bold font-mono tracking-tighter">SP</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-bold text-foreground font-heading tracking-tight">SpritePixelart</span>
          <span className="text-[9px] text-muted-foreground font-mono">AI Character Studio</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <p className="mb-1.5 px-2.5 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard/characters/new" && pathname.startsWith("/dashboard/characters/new"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/8 text-primary border border-primary/15"
                      : "text-sidebar-foreground/60 border border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-3.5 w-3.5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4 opacity-40" />

        <p className="mb-1.5 px-2.5 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Quick Actions
        </p>
        <div className="px-2.5">
          <ProcessJobsButton />
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[9px] text-muted-foreground font-mono text-center">SpritePixelart MVP</p>
      </div>
    </aside>
  );
}
