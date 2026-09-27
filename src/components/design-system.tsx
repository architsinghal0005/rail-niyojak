import React from "react";
import { 
  AlertTriangle, CheckCircle, Info, XCircle, 
  ChevronRight, Loader2, Calendar, Filter
} from "lucide-react";

// ----------------------------------------------------------------------
// TYPOGRAPHY & HEADERS
// ----------------------------------------------------------------------

export function SectionHeader({ title, description, action }: { title: React.ReactNode, description?: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div className="mb-4 border-b-2 border-slate-300 pb-2 flex justify-between items-end">
      <div>
        <h2 className="text-lg font-bold text-slate-900 border-l-4 border-red-800 pl-2 leading-tight">
          {title}
        </h2>
        {description && <p className="text-xs text-slate-500 mt-1 pl-3">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------
// CARDS & CONTAINERS
// ----------------------------------------------------------------------

export function GovernmentCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white border border-slate-300 rounded-sm shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function MetricCard({ title, value, trend, trendIcon, status = "neutral" }: { 
  title: string, value: React.ReactNode, trend?: React.ReactNode, trendIcon?: React.ReactNode,
  status?: "neutral" | "success" | "warning" | "danger"
}) {
  const statusColors = {
    neutral: "border-slate-300",
    success: "border-t-4 border-t-emerald-600 border-slate-300",
    warning: "border-t-4 border-t-amber-500 border-slate-300",
    danger: "border-t-4 border-t-red-600 border-slate-300",
  };

  return (
    <div className={`bg-white p-3 border rounded-sm shadow-sm ${statusColors[status]}`}>
      <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {(trend || trendIcon) && (
        <div className="text-[10px] font-medium text-slate-500 flex items-center mt-1">
          {trendIcon && <span className="mr-1">{trendIcon}</span>}
          {trend}
        </div>
      )}
    </div>
  );
}

export function InfoPanel({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-slate-50 border border-slate-200 border-l-4 border-l-slate-500 p-3 rounded-sm ${className}`}>
      {title && <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>}
      <div className="text-xs text-slate-600">{children}</div>
    </div>
  );
}

// ----------------------------------------------------------------------
// BUTTONS & BADGES
// ----------------------------------------------------------------------

export function GovernmentButton({ 
  children, variant = "primary", size = "md", className = "", ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger",
  size?: "sm" | "md" | "lg"
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-red-800 text-white hover:bg-red-900 focus:ring-red-800",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-4 py-1.5",
    lg: "text-base px-6 py-2",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function StatusBadge({ 
  status, children 
}: { 
  status: "success" | "warning" | "danger" | "info" | "neutral", 
  children: React.ReactNode 
}) {
  const colors = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-300",
    warning: "bg-amber-100 text-amber-900 border-amber-300",
    danger: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300",
    neutral: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${colors[status]}`}>
      {children}
    </span>
  );
}

// ----------------------------------------------------------------------
// DATA PRESENTATION
// ----------------------------------------------------------------------

export function DataTable({ headers, children, className = "", maxHeight }: { headers: React.ReactNode[], children: React.ReactNode, className?: string, maxHeight?: string }) {
  return (
    <div className={`w-full overflow-x-auto border border-slate-300 rounded-sm ${className}`} style={{ maxHeight }}>
      <table className="w-full text-left text-sm border-collapse bg-white relative">
        <thead className="bg-slate-100 border-b-2 border-slate-300 sticky top-0 z-10 shadow-sm">
          <tr>
            {headers.map((header, i) => (
              <th key={i} className="px-3 py-2 font-bold text-slate-800 whitespace-nowrap bg-slate-100">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function AlertBanner({ 
  type = "info", title, message 
}: { 
  type?: "info" | "warning" | "danger" | "success", 
  title?: string, 
  message: React.ReactNode 
}) {
  const config = {
    info: { icon: Info, colors: "bg-blue-50 border-blue-300 text-blue-800 border-l-blue-600" },
    warning: { icon: AlertTriangle, colors: "bg-amber-50 border-amber-300 text-amber-900 border-l-amber-500" },
    danger: { icon: XCircle, colors: "bg-red-50 border-red-300 text-red-900 border-l-red-600" },
    success: { icon: CheckCircle, colors: "bg-emerald-50 border-emerald-300 text-emerald-900 border-l-emerald-600" },
  };
  
  const Icon = config[type].icon;

  return (
    <div className={`flex items-start p-3 border border-l-4 rounded-sm shadow-sm mb-4 ${config[type].colors}`}>
      <Icon className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
      <div>
        {title && <h4 className="font-bold text-sm mb-0.5">{title}</h4>}
        <div className="text-xs">{message}</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// NAVIGATION & LAYOUT
// ----------------------------------------------------------------------

export function Breadcrumb({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.href ? (
            <a href={item.href} className="hover:text-red-800 hover:underline">{item.label}</a>
          ) : (
            <span className="text-slate-800">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-3 w-3 mx-1" />}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Tabs({ 
  tabs, activeTab, onChange 
}: { 
  tabs: string[], activeTab: string, onChange?: (tab: string) => void 
}) {
  return (
    <div className="flex border-b border-slate-300 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange?.(tab)}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === tab 
              ? "border-red-800 text-red-800 bg-white" 
              : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 bg-slate-100 p-2 border border-slate-300 rounded-sm mb-4 text-sm">
      <div className="flex items-center text-slate-500 font-bold px-2 border-r border-slate-300">
        <Filter className="h-4 w-4 mr-1" /> Filters
      </div>
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// STATE & FEEDBACK
// ----------------------------------------------------------------------

export function EmptyState({ 
  icon: Icon = Info, title, description, action 
}: { 
  icon?: React.ElementType, title: string, description: string, action?: React.ReactNode 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-400 rounded-sm bg-slate-50 text-center">
      <Icon className="h-8 w-8 text-slate-400 mb-3" />
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingState({ text = "Loading data..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 className="h-6 w-6 animate-spin mb-2 text-red-800" />
      <span className="text-xs font-bold uppercase tracking-widest">{text}</span>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPLEX SHELLS (Modal, Drawer, Timeline)
// ----------------------------------------------------------------------

export function Modal({ 
  isOpen, onClose, title, children, footer 
}: { 
  isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, footer?: React.ReactNode 
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <div className="bg-white border-2 border-slate-400 rounded-sm shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-3 border-b border-slate-300 bg-slate-100">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><XCircle className="h-5 w-5" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-sm">
          {children}
        </div>
        {footer && (
          <div className="p-3 border-t border-slate-300 bg-slate-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Drawer({ 
  isOpen, onClose, title, children 
}: { 
  isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode 
}) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-300 shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b-2 border-red-800 bg-slate-50">
          <h3 className="font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-red-800"><XCircle className="h-5 w-5" /></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-sm">
          {children}
        </div>
      </div>
    </>
  );
}

export function Timeline({ 
  items 
}: { 
  items: { time: string, title: string, description?: string, status?: "completed" | "active" | "pending" }[] 
}) {
  return (
    <div className="relative border-l-2 border-slate-300 ml-3 my-4 space-y-6">
      {items.map((item, i) => (
        <div key={i} className="relative pl-5">
          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
            item.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
            item.status === 'active' ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'
          }`} />
          <div className="text-[10px] font-bold text-slate-500 uppercase">{item.time}</div>
          <div className={`text-sm font-bold ${item.status === 'active' ? 'text-slate-900' : 'text-slate-700'}`}>
            {item.title}
          </div>
          {item.description && <div className="text-xs text-slate-600 mt-1">{item.description}</div>}
        </div>
      ))}
    </div>
  );
}
