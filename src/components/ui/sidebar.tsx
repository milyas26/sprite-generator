"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Library, PlusCircle, PenLine, Boxes } from "lucide-react";
import { ProcessJobsButton } from "@/features/generation/components/process-jobs-button";
import { CreateSpriteDialog } from "@/features/sprites/components/create-sprite-dialog";
import { CreateAssetDialog } from "@/features/assets/components/create-asset-dialog";

const spriteItems = [
  { href: "/dashboard", label: "Sprite Library", icon: Library },
  { href: "/dashboard/editor", label: "Sprite Editor", icon: PenLine },
] as const;

const assetItems = [
  { href: "/dashboard/assets", label: "Asset Library", icon: Boxes },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [spriteDialogOpen, setSpriteDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-12 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/15 ring-1 ring-primary/20 flex-shrink-0">
          <span className="text-primary text-[10px] font-bold font-mono tracking-tighter">SP</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-bold text-foreground font-heading tracking-tight">SpritePixelart</span>
          <span className="text-[9px] text-muted-foreground font-mono">AI Sprite & Asset Studio</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <p className="mb-1.5 px-2.5 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Sprites
        </p>
        <ul className="space-y-0.5">
          {spriteItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/dashboard/editor" && pathname.startsWith("/dashboard/editor"));
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
          <li>
            <button
              onClick={() => setSpriteDialogOpen(true)}
              className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150 text-sidebar-foreground/60 border border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              New Sprite
            </button>
          </li>
        </ul>

        <Separator className="my-4 opacity-40" />

        <p className="mb-1.5 px-2.5 text-[9px] font-mono font-semibold tracking-widest text-muted-foreground uppercase">
          Assets
        </p>
        <ul className="space-y-0.5">
          {assetItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard/assets" && pathname.startsWith("/dashboard/assets"));
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
          <li>
            <button
              onClick={() => setAssetDialogOpen(true)}
              className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150 text-sidebar-foreground/60 border border-transparent hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              New Asset
            </button>
          </li>
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[9px] text-muted-foreground font-mono text-center">SpritePixelart MVP</p>
      </div>

      <CreateSpriteDialog open={spriteDialogOpen} onOpenChange={setSpriteDialogOpen} />
      <CreateAssetDialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen} />
    </aside>
  );
}
