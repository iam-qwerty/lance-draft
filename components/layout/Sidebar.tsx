"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Zap,
  LayoutDashboard,
  User,
  Filter,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigation items for the sidebar */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Proposals", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/filters", label: "Filters", icon: Filter },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

/**
 * Sidebar navigation for the dashboard.
 * Shows nav links, quota indicator, and user avatar.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-border bg-sidebar">
      {/* ---- Logo ---- */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <Zap className="w-5 h-5 text-primary" />
        <span className="text-base font-bold tracking-tight text-foreground">
          LanceDraft
        </span>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ---- Quota Indicator ---- */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-secondary/50 border border-border">
        <Link href="/billing" className="block">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <FileText className="w-3.5 h-3.5" />
            Proposals this month
          </div>
          <div className="text-sm font-semibold text-foreground">
            {/* TODO: Wire up real quota from Convex */}
            0 / 0
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: "0%" }}
            />
          </div>
        </Link>
      </div>

      {/* ---- User ---- */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-border">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
        <span className="text-sm text-muted-foreground truncate">Account</span>
      </div>
    </aside>
  );
}
