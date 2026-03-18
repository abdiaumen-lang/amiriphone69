import { Link, useLocation } from "wouter";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Button } from "@/components/UI";
import { formatDZD } from "@/lib/utils";
import { useCart } from "@/store/Store";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <AppLayout>
        <PageTransition className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-8 text-lg">On dirait que vous n'avez pas encore trouvé ce que vous cherchez. Découvrez nos offres !</p>
            <Link href="/products">
              <Button size="lg" className="rounded-full w-full">Continuer vos achats</Button>
            </Link>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Votre Panier</h1>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 sm:p-8 space-y-8">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex flex-col sm:flex-row gap-6 items-center pb-8 border-b border-border last:border-0 last:pb-0">
                      <div className="w-32 h-32 bg-secondary/50 rounded-2xl p-4 shrink-0 flex items-center justify-center">
                        <img 
                          src={item.product.images?.[0] || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&q=80"} 
                          alt={item.product.name} 
                          className="max-w-full max-h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                        <div className="text-muted-foreground text-sm mb-4">{item.product.brand}</div>
                        <div className="font-display font-bold text-primary text-xl">{formatDZD(item.product.price)}</div>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center bg-secondary rounded-full p-1 border border-border">
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button 
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button 
                          className="text-sm text-destructive font-medium flex items-center gap-1 hover:underline"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-3xl p-8 sticky top-32 shadow-sm">
                <h3 className="text-xl font-display font-bold mb-6">Résumé de la commande</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{formatDZD(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de livraison</span>
                    <span className="text-right text-xs bg-secondary px-2 py-1 rounded">Calculé à l'étape suivante</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-bold text-2xl text-primary">{formatDZD(subtotal)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full rounded-2xl h-14 text-lg shadow-xl shadow-primary/20 group" onClick={() => setLocation('/checkout')}>
                  Passer la commande
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Paiement sécurisé à la livraison
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
