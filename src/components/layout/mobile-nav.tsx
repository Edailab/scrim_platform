"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Swords, Users, Trophy, CalendarDays } from "lucide-react";

const navItems = [
  { href: "/arena", label: "아레나", icon: Swords },
  { href: "/ranking", label: "랭킹", icon: Trophy },
  { href: "/team", label: "팀", icon: Users },
  { href: "/matches", label: "경기", icon: CalendarDays },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
