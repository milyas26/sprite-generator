"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  Library,
  PlusCircle,
} from "lucide-react";
import { ProcessJobsButton } from "@/features/generation/components/process-jobs-button";

const navItems = [
  {
    href: "/dashboard",
    label: "Library",
    icon: Library,
  },
  {
    href: "/dashboard/characters/new",
    label: "New Character",
    icon: PlusCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 px-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/15 flex-shrink-0">
          <span className="text-primary-foreground text-[11px] font-bold font-mono tracking-tighter">
            SP
          </span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-foreground font-heading tracking-tight">
            Sprite Pixelart
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            AI Character Studio
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard/characters/new" && pathname.startsWith("/dashboard/characters/new"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="my-5 opacity-50" />

        <p className="mb-2 px-3 text-[10px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Quick Actions
        </p>
        <div className="px-3">
          <ProcessJobsButton />
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[10px] text-muted-foreground font-mono text-center">
          Sprite Pixelart MVP
        </p>
      </div>
    </aside>
  );
}
