import { Link, useLocation } from "wouter";
import { useAuth } from "@/store/Store";
import { LayoutDashboard, Smartphone, ShoppingBag, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTransition } from "./UI";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isAuthenticated && location !== '/admin/login') {
    setLocation('/admin/login');
    return null;
  }

  const menu = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Produits", path: "/admin/products", icon: Smartphone },
    { name: "Commandes", path: "/admin/orders", icon: ShoppingBag },
    { name: "Paramètres", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-display font-bold">A</div>
            <span className="font-display font-bold text-lg">Admin Amiri</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {menu.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={() => { logout(); setLocation('/admin/login'); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  );
}
