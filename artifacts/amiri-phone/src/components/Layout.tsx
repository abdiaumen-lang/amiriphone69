import { Link, useLocation } from "wouter";
import { useCart } from "@/store/Store";
import { ShoppingCart, Menu, X, Smartphone, CheckCircle, Truck, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { totalItems } = useCart();
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
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            A
          </div>
          <span className={cn("font-display font-bold text-xl tracking-tight transition-colors", isScrolled ? "text-foreground" : "text-foreground")}>
            Amiri Phone
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
        <div className="md:hidden absolute top-full left-0 w-full glass border-t border-border/50 p-4 flex flex-col gap-4 animate-in slide-in-from-top-4">
          {navLinks.map(link => (
            <Link key={link.path} href={link.path} onClick={() => setMobileMenuOpen(false)} className={cn(
              "block p-3 rounded-xl text-base font-medium",
              location === link.path ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
            )}>
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-display font-bold">A</div>
              <span className="font-display font-bold text-xl">Amiri Phone</span>
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
          © {new Date().getFullYear()} Amiri Phone. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/213557325417"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-50 group"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.92 2.8.92h.004c3.18 0 5.767-2.587 5.767-5.766 0-3.18-2.586-5.762-5.766-5.762zm3.352 8.128c-.147.416-.902.8-1.284.853-.336.046-.728.082-2.313-.574-1.92-1.043-3.136-3.037-3.232-3.188-.091-.146-.767-1.026-.767-1.947 0-.92.474-1.378.641-1.558.167-.182.364-.228.484-.228.121 0 .242 0 .341.004.106.005.239-.038.373.282.146.347.502 1.226.547 1.322.046.095.076.205.016.342-.061.137-.091.223-.182.333-.091.11-.19.232-.273.324-.091.096-.186.198-.077.387.11.192.486.804 1.1 1.348.793.704 1.402.923 1.597 1.02.196.096.31.082.425-.046.115-.128.497-.584.628-.784.132-.2.264-.169.444-.105.18.068 1.144.542 1.34.639.197.096.326.146.374.228.046.082.046.479-.101.895z"/>
      </svg>
      <span className="absolute right-full mr-4 bg-white text-foreground px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
        Besoin d'aide ?
      </span>
    </a>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
