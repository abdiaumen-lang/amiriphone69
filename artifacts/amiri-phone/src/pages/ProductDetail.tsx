import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Button, Badge } from "@/components/UI";
import { cn, formatDZD } from "@/lib/utils";
import { ShoppingCart, Star, Shield, Truck, RotateCcw, Clock } from "lucide-react";
import { useCart } from "@/store/Store";
import { useToast } from "@/hooks/use-toast";
import { useGetProduct } from "@workspace/api-client-react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = parseInt(params?.id || "0");
  
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId } });
  
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  // Reset selected image when product loads
  useEffect(() => {
    if (product) setSelectedImage(0);
  }, [product]);

  if (isLoading) {
    return (
      <AppLayout>
         <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center animate-pulse">
            <div className="w-full grid md:grid-cols-2 gap-12">
               <div className="aspect-square bg-secondary rounded-3xl"></div>
               <div className="space-y-6">
                 <div className="h-8 bg-secondary rounded w-3/4"></div>
                 <div className="h-12 bg-secondary rounded w-1/4"></div>
                 <div className="h-32 bg-secondary rounded w-full"></div>
                 <div className="h-14 bg-primary/20 rounded-xl w-full"></div>
               </div>
            </div>
         </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Produit introuvable</h2>
          <p className="text-muted-foreground">Ce produit n'existe pas ou a été retiré.</p>
        </div>
      </AppLayout>
    );
  }

  const images = product.images?.length ? product.images : ["https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"];

  const handleAdd = () => {
    addItem(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} est dans votre panier.`,
    });
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Images Gallery */}
            <div className="space-y-6">
              <div className="aspect-square bg-secondary/30 rounded-[2.5rem] border border-border flex items-center justify-center p-8 relative overflow-hidden">
                {product.onSale && product.discount && (
                  <Badge variant="danger" className="absolute top-6 left-6 text-sm px-4 py-1">-{product.discount}%</Badge>
                )}
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply animate-in fade-in duration-500"
                  key={selectedImage}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedImage(i)}
                      className={`w-24 h-24 shrink-0 rounded-2xl border-2 overflow-hidden bg-secondary/30 ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="mb-2 text-primary font-semibold tracking-wide uppercase text-sm">
                {product.brand || "Smartphone"}
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-[#FF9500]">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <span className="text-sm font-medium underline text-muted-foreground">{product.reviewCount || 8} avis</span>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-display font-bold text-foreground">{formatDZD(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-muted-foreground line-through mb-1">{formatDZD(product.originalPrice)}</span>
                  )}
                </div>
              </div>

              {/* Scarcity / Countdown (Fake urgency for conversion) */}
              {product.stock > 0 && product.stock < 10 && (
                 <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-8 flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-bold">Attention, stock limité !</div>
                      <div className="text-sm">Plus que {product.stock} articles disponibles à ce prix.</div>
                    </div>
                 </div>
              )}

              <Button size="lg" className="w-full mb-8 h-16 text-lg rounded-2xl shadow-xl shadow-primary/20" onClick={handleAdd}>
                <ShoppingCart className="mr-2 w-6 h-6" /> Ajouter au panier
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 p-6 bg-secondary/50 rounded-3xl border border-border">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">Livraison Rapide</div>
                    <div className="text-xs text-muted-foreground">48 Wilayas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">Garantie</div>
                    <div className="text-xs text-muted-foreground">12 Mois</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-8 h-8 text-primary" />
                  <div>
                    <div className="font-semibold text-sm">Retour Facile</div>
                    <div className="text-xs text-muted-foreground">Sous 7 jours</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <div>
                    <div className="font-semibold text-sm">Paiement Sécurisé</div>
                    <div className="text-xs text-muted-foreground">À la livraison</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h3 className="text-foreground font-display text-xl mb-4">Description du produit</h3>
                <p className="whitespace-pre-line leading-relaxed text-base">
                  {product.description || "Un smartphone exceptionnel offrant des performances de pointe, un design élégant et un appareil photo professionnel. Parfait pour toutes vos tâches quotidiennes et plus encore."}
                </p>
                
                {product.specs && Object.keys(product.specs).length > 0 && (
                  <div className="mt-8">
                     <h3 className="text-foreground font-display text-xl mb-4">Caractéristiques</h3>
                     <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {Object.entries(product.specs).map(([key, value], i) => (
                           <div key={key} className={cn("grid grid-cols-3 p-4", i % 2 === 0 ? "bg-secondary/30" : "")}>
                              <div className="font-medium text-foreground capitalize">{key}</div>
                              <div className="col-span-2">{String(value)}</div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
