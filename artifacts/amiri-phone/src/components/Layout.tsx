import { Link, useLocation } from "wouter";
import { useCart } from "@/store/Store";
import { ShoppingCart, Menu, X, Smartphone, CheckCircle, Truck, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getSafeImageUrl } from "@/lib/utils";
import { useGetSettings, useListCategories } from "@workspace/api-client-react";

export function Navbar() {
  const { data } = useGetSettings();
  const settings = data as { storeLogo?: string; storeName?: string } | undefined;
  const { totalItems } = useCart();
  const { data: categories } = useListCategories();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Smartphones", path: "/products?category=smartphones" },
    { name: "Accessoires", path: "/products?category=accessoires" },
  ];

  return (
    <header className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300",
      isScrolled ? "glass py-3" : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src={getSafeImageUrl(settings?.storeLogo || "/images/logo.png")} 
            alt="Logo" 
            className="w-10 h-10 object-contain max-h-10 rounded-xl shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform" 
          />
          <span className={cn("font-display font-bold text-xl tracking-tight transition-colors truncate max-w-[50vw]", isScrolled ? "text-foreground" : "text-foreground")}>
            {settings?.storeName || "Amiri Phone"}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.path} href={link.path} className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location === link.path ? "text-primary" : "text-muted-foreground"
            )}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Link>
          
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass border-t border-border/50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-4 max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="space-y-2">
            {navLinks.map(link => (
              <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)} className={cn(
                "block p-3 rounded-xl text-base font-medium",
                location === link.path ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
              )}>
                {link.name}
              </Link>
            ))}
          </div>

          {categories && categories.length > 0 && (
            <div className="pt-4 mt-2 border-t border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Catégories</h3>
              <div className="grid grid-cols-2 gap-3 pb-8">
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/products?category=${cat.name}`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-background/50 border border-border rounded-2xl hover:border-primary/50 hover:bg-background transition-colors active:scale-95"
                  >
                    {cat.icon ? (
                      <img src={getSafeImageUrl(cat.icon)} alt={cat.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="font-bold text-muted-foreground">#</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-center line-clamp-1 break-all px-1 leading-tight">{cat.nameAr || cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { data } = useGetSettings();
  const settings = data as { storeLogo?: string; storeName?: string; googleMapsUrl?: string } | undefined;
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={getSafeImageUrl(settings?.storeLogo || "/images/logo.png")} 
                alt="Logo" 
                className="w-12 h-12 object-contain max-h-12 mb-4 drop-shadow-md" 
              />
              <span className="font-display font-bold text-xl mb-4">{settings?.storeName || "Amiri Phone"}</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Votre destination premium pour les smartphones et accessoires en Algérie. Les meilleurs prix, garantis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>📞 0557 32 54 17</li>
              <li>📍 89 Rue Mahmoud KHODJAT EL DJELD, Bir Mourad Raïs</li>
              <li>⏰ Ouvert tous les jours jusqu'à 23:30</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Liens Rapides</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Tous les produits</Link></li>
              <li><Link href="/products?category=apple" className="hover:text-primary transition-colors">Univers Apple</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Panier</Link></li>
              <li><Link href="/admin/login" className="hover:text-primary transition-colors">Espace Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Nos Engagements</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" /> Livraison 48 Wilayas
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" /> Garantie Qualité
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle className="w-5 h-5 text-primary" /> Paiement à la livraison
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.storeName || "Amiri Phone"}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFAB() {
  const { data } = useGetSettings();
  const settings = data as { whatsappNumber?: string; storePhone?: string } | undefined;
  const phone = settings?.whatsappNumber || settings?.storePhone || "213557325417";

  return (
    <a
      href={`https://wa.me/${phone.replace(/\s+/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 group"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      <span className="absolute right-full mr-4 bg-white text-foreground px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        WhatsApp
      </span>
    </a>
  );
}

export function TelegramFAB() {
  const { data } = useGetSettings();
  const settings = data as { telegramUsername?: string } | undefined;
  if (!settings?.telegramUsername) return null;

  return (
    <a
      href={`https://t.me/${settings.telegramUsername}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 w-14 h-14 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0088cc]/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 group"
      aria-label="Contactez-nous sur Telegram"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2-0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/>
      </svg>
      <span className="absolute right-full mr-4 bg-white text-foreground px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        Telegram
      </span>
    </a>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data } = useGetSettings();
  const settings = data as Record<string, any> | undefined;

  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    
    if (settings.primaryColor) {
      root.style.setProperty("--primary-override", settings.primaryColor);
      root.style.setProperty("--ring", settings.primaryColor);
    }
    
    if (settings.borderRadius) {
      root.style.setProperty("--radius-override", settings.borderRadius);
    }
    
    if (settings.fontFamily) {
      root.style.setProperty("--font-sans-override", `'${settings.fontFamily}', sans-serif`);
      root.style.setProperty("--font-display-override", `'${settings.fontFamily}', sans-serif`);
    }
  }, [settings]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
      <WhatsAppFAB />
      <TelegramFAB />
    </div>
  );
}
