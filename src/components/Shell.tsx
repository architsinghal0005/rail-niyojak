"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAppState } from "@/lib/store";
import { 
  Menu, X, Home, Clock, Calendar, 
  Map as MapIcon, Activity, AlertTriangle, 
  CalendarDays, CalendarRange, BarChart3, 
  ScrollText, ChevronRight, User, Bell, ChevronLeft, Play, Globe
} from "lucide-react";
import AIAssistant from "./AIAssistant";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { t, lang, setLang } = useTranslation();
  const { state, dispatch } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  const unreadCount = state.notifications?.filter(n => !n.read).length || 0;

  const handleNotificationClick = (notif: import('@/lib/store').Notification) => {
    dispatch({ type: "MARK_NOTIFICATION_READ", payload: notif.id });
    setIsNotificationsOpen(false);
    
    // basic navigation logic
    if (notif.title === "URGENT MAINTENANCE" || notif.title === "TASK OVERDUE") {
      router.push("/backlog");
    } else if (notif.title === "BLOCK APPROVED" || notif.title === "BLOCK REJECTED" || notif.title === "RESOURCE CONFLICT" || notif.title === "BLOCK CONFLICT") {
      router.push("/block-planner");
    } else if (notif.title === "EMERGENCY EVENT" || notif.title === "PLAN REPLANNED") {
      router.push("/replanning");
    } else if (notif.title === "HARVEST OPPORTUNITY") {
      router.push("/harvesting");
    } else {
      router.push("/control-tower");
    }
  };

  const isActiveRoute = (id: string, href: string) => {
    if (href === "/") return pathname === "/";
    if (id === "Block Planner") {
      return pathname === "/block-planner" || pathname === "/weekly-plan" || pathname === "/monthly-plan";
    }
    if (id === "Simulation & Replanning") {
      return pathname === "/simulator" || pathname === "/replanning";
    }
    if (id === "Reports & Audit") {
      return pathname === "/analytics" || pathname === "/audit";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navigation = [
    { name: t("nav.control_tower") || "Control Tower", icon: Home, href: "/control-tower", id: "Control Tower" },
    { name: "Maintenance Tasks", icon: Clock, href: "/backlog", id: "Maintenance Tasks" },
    { name: t("nav.planner") || "Block Planner", icon: Calendar, href: "/block-planner", id: "Block Planner" },
    { name: t("nav.harvesting") || "Block Harvesting", icon: Activity, href: "/harvesting", id: "Block Harvesting" },
    { name: "Simulation & Replanning", icon: AlertTriangle, href: "/simulator", id: "Simulation & Replanning" },
    { name: "Reports & Audit", icon: BarChart3, href: "/analytics", id: "Reports & Audit" },
  ];

  const getBreadcrumbs = () => {
    switch (pathname) {
      case "/control-tower": return ["CONTROL TOWER"];
      case "/backlog": return ["MAINTENANCE TASKS"];
      case "/block-planner": return ["BLOCK PLANNER", "DAILY"];
      case "/weekly-plan": return ["BLOCK PLANNER", "WEEKLY"];
      case "/monthly-plan": return ["BLOCK PLANNER", "MONTHLY"];
      case "/harvesting": return ["BLOCK HARVESTING"];
      case "/simulator": return ["SIMULATION & REPLANNING", "WHAT-IF"];
      case "/replanning": return ["SIMULATION & REPLANNING", "EMERGENCY REPLANNING"];
      case "/analytics": return ["REPORTS & AUDIT", "PERFORMANCE"];
      case "/audit": return ["REPORTS & AUDIT", "AUDIT TRAIL"];
      default: return ["CONTROL TOWER"];
    }
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b-4 border-b-red-800 bg-white px-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-100 rounded text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/train-logo.png`} alt="Rail Niyojak Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("brand.govt")} / {t("brand.ministry")}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-slate-900">{t("brand.name")}</span>
                <span className="text-xs font-medium text-red-800 hidden md:inline">{t("brand.subtitle")}</span>
              </div>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href="/demo" 
            className="hidden md:flex items-center gap-1 rounded bg-indigo-600 px-3 py-1 text-xs font-bold border border-indigo-800 text-white uppercase tracking-wider hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Play className="h-3 w-3" />
            SIH Demo Mode
          </a>

          <a 
            href="/field-mode" 
            className="hidden md:flex items-center gap-1 rounded bg-slate-800 px-3 py-1 text-xs font-bold border border-slate-900 text-white uppercase tracking-wider hover:bg-slate-700 shadow-sm transition-colors"
          >
            <MapIcon className="h-3 w-3" />
            Field Mode
          </a>
          
          {/* Language Selector */}
          <div className="flex items-center rounded border border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-widest overflow-hidden">
            <button 
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 transition-colors ${lang === "en" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              English
            </button>
            <div className="w-px h-full bg-slate-300"></div>
            <button 
              onClick={() => setLang("hi")}
              className={`px-3 py-1.5 transition-colors ${lang === "hi" ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-200"}`}
            >
              हिंदी
            </button>
          </div>

          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold border border-amber-300 text-amber-900 uppercase tracking-wider">
              Prototype / Synthetic Data
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1"></span>
              System Status: Operational
            </span>
          </div>
          
          <div className="h-8 w-px bg-slate-300"></div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="relative text-slate-500 hover:text-slate-700"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-sm z-50 flex flex-col max-h-[80vh]">
                  <div className="flex justify-between items-center p-3 border-b border-slate-200 bg-slate-50">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Notifications</span>
                    <div className="flex gap-2">
                      <button onClick={() => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" })} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Mark All Read</button>
                      <button onClick={() => dispatch({ type: "CLEAR_NOTIFICATIONS" })} className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest">Clear</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {state.notifications?.length === 0 ? (
                      <div className="text-center p-4 text-xs text-slate-500">No notifications</div>
                    ) : (
                      state.notifications?.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 border rounded-sm cursor-pointer transition-colors ${n.read ? 'bg-white border-slate-100 hover:bg-slate-50' : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${n.severity === 'Critical' ? 'text-red-700' : n.severity === 'High' ? 'text-amber-600' : 'text-blue-700'}`}>{n.title}</span>
                            <span className="text-[9px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`text-xs ${n.read ? 'text-slate-600' : 'text-slate-900 font-semibold'}`}>{n.message}</div>
                          <div className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">{n.relatedEntity}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Control Officer</span>
                <span className="text-[10px] text-slate-500">Northern Railway</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside 
          className={`flex flex-col border-r border-slate-300 bg-white transition-all duration-300 ${
            isSidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      className={`group flex items-center rounded-sm px-2 py-2 text-sm font-medium ${
                        isActiveRoute(item.id, item.href)
                          ? "bg-slate-100 text-red-800 border-l-4 border-red-800" 
                          : "text-slate-700 hover:bg-slate-50 hover:text-red-800 border-l-4 border-transparent"
                      }`}
                      title={!isSidebarOpen ? item.name : undefined}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${
                        isSidebarOpen 
                          ? (isActiveRoute(item.id, item.href) ? "mr-3 text-red-800" : "mr-3 text-slate-500 group-hover:text-red-700") 
                          : (isActiveRoute(item.id, item.href) ? "mx-auto text-red-800" : "mx-auto text-slate-500 group-hover:text-red-700")
                      }`} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="border-t border-slate-200 p-4">
            {isSidebarOpen ? (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="flex w-full items-center text-xs text-slate-500 hover:text-slate-800"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Collapse Sidebar
              </button>
            ) : (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex w-full justify-center text-slate-500 hover:text-slate-800"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-6 py-2 text-xs font-medium text-slate-500 shrink-0">
            <a href="/" className="hover:text-red-800 hover:underline">{t("brand.name")}</a>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <span className={index === breadcrumbs.length - 1 ? "text-slate-800" : "hover:text-red-800 hover:underline"}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-7xl h-full">
              {children}
            </div>
          </main>
          
          {/* FOOTER */}
          <footer className="border-t border-slate-300 bg-slate-200 px-6 py-3 text-xs text-slate-600 flex justify-between items-center shrink-0">
            <div>
              &copy; 2026 Ministry of Railways, Government of India. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Use</a>
              <span>Version 1.0.0 (SIH26027)</span>
            </div>
          </footer>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
