"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function InternalTabs({ tabs }: { tabs: { name: string; href: string; active?: boolean; onClick?: () => void }[] }) {
  const pathname = usePathname();
  
  return (
    <div className="flex border-b border-slate-300 mb-4 bg-white px-2 pt-2 shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.active !== undefined ? tab.active : pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            onClick={tab.onClick ? (e) => { e.preventDefault(); tab.onClick!(); } : undefined}
            className={`px-4 py-2 text-sm font-bold border-b-4 transition-colors ${
              isActive 
                ? "border-red-800 text-red-800 bg-slate-50" 
                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
