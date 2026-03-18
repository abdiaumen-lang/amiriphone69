import { Link, useLocation } from "wouter";
import { useAuth } from "@/store/Store";
import {
  LayoutDashboard, Smartphone, ShoppingBag, Settings, LogOut,
  Palette, Store, ToggleLeft, Plug, FileText, ChevronLeft, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "./UI";
import { useState } from "react";

const MENU = [
  { group: "Principal", items: [
    { name: "Dashboard",   path: "/admin",          icon: LayoutDashboard },
    { name: "Produits",    path: "/admin/products", icon: Smartphone },
    { name: "Commandes",   path: "/admin/orders",   icon: ShoppingBag },
  ]},
  { group: "Configuration", items: [
    { name: "Paramètres",  path: "/admin/settings", icon: Settings },
  ]},
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated && location !== '/admin/login') {
    setLocation('/admin/login');
    return null;
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn("p-4 border-b border-border flex items-center", collapsed ? "justify-center" : "gap-3 px-5")}>
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0">A</div>
          {!collapsed && <span className="font-display font-bold text-base truncate">Admin Amiri</span>}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto p-1 hover:bg-secondary rounded-lg text-muted-foreground shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {MENU.map(group => (
          <div key={group.group}>
            {!collapsed && (
              <div className="px-5 py-2 text-xs font-bold uppercase text-muted-foreground/60 tracking-wider">{group.group}</div>
            )}
            {group.items.map(item => {
              const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl font-medium transition-all text-sm",
                    collapsed ? "justify-center" : "",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-2 border-t border-border">
          <button onClick={() => setCollapsed(false)} className="w-full flex justify-center p-2 hover:bg-secondary rounded-xl text-muted-foreground transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={cn("p-3 border-t border-border", collapsed ? "" : "px-4")}>
        <Link href="/" className={cn("flex items-center gap-2.5 py-2 px-3 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-xl transition-colors mb-1", collapsed ? "justify-center" : "")} title={collapsed ? "Voir le site" : undefined}>
          <Store className="w-4 h-4 shrink-0" />
          {!collapsed && "Voir le site"}
        </Link>
        <button onClick={() => { logout(); setLocation('/admin/login'); }}
          className={cn("flex items-center gap-2.5 py-2 px-3 w-full text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors", collapsed ? "justify-center" : "")}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-secondary/50">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col bg-card border-r border-border fixed inset-y-0 left-0 z-20 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-50">
            <div className="absolute top-4 right-4">
              <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-secondary rounded-xl"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <span className="font-bold">Admin Amiri</span>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300 lg:p-8 p-4 pt-16 lg:pt-8", collapsed ? "lg:ml-16" : "lg:ml-64")}>
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
