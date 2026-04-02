import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Button, Badge } from "@/components/UI";
import { cn, formatDZD, getSafeImageUrl } from "@/lib/utils";
import { 
  ShoppingCart, Star, Shield, Truck, Clock, 
  MessageSquare, Play 
} from "lucide-react";
import { useCart } from "@/store/Store";
import { useToast } from "@/hooks/use-toast";
import { useGetProduct, getGetProductQueryKey, useListReviews } from "@workspace/api-client-react";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = parseInt(params?.id || "0");
  
  const { data: product, isLoading } = useGetProduct(productId, { query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) } });
  
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0] || "",
      } as any);
      toast({
        title: "Produit ajouté",
        description: `${product.name} a été ajouté à votre panier.`,
      });
    }
  };

  const images = product?.images?.length ? product.images : [""];

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

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Images */}
            <div className="space-y-6">
              <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-border shadow-inner p-8 flex items-center justify-center">
                <motion.img 
                  src={getSafeImageUrl(images[selectedImage])} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply"
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide py-2">
                  {images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedImage(i)}
                      className={`w-24 h-24 shrink-0 rounded-2xl border-2 overflow-hidden bg-white transition-all ${selectedImage === i ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-border'}`}
                    >
                      <img src={getSafeImageUrl(img)} alt="" className="w-full h-full object-contain mix-blend-multiply p-2" />
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
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-5 h-5 fill-current",
                        i < Math.round(Number(product.averageRating) || 5) ? "text-yellow-500" : "text-muted/30 fill-none"
                      )} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium underline text-muted-foreground">{product.reviewCount || 0} avis</span>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-display font-bold text-foreground">{formatDZD(Number(product.price))}</span>
                  {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                    <span className="text-xl text-muted-foreground line-through mb-1">{formatDZD(Number(product.originalPrice))}</span>
                  )}
                </div>
              </div>

              {/* Scarcity / Countdown */}
              {product.stock > 0 && product.stock < 10 && (
                 <div className="bg-destructive/5 border border-destructive/10 text-destructive rounded-xl p-4 mb-8 flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-bold">Attention, stock limité !</div>
                      <div className="text-sm">Plus que {product.stock} articles disponibles à ce prix.</div>
                    </div>
                 </div>
              )}

              <Button size="lg" className="w-full mb-8 h-16 text-lg rounded-2xl shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-transform" onClick={handleAdd}>
                <ShoppingCart className="mr-2 w-6 h-6 transition-transform group-hover:-translate-y-1" /> Ajouter au panier
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 p-6 bg-secondary/30 rounded-3xl border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Livraison Rapide</div>
                    <div className="text-xs text-muted-foreground">48 Wilayas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Garantie</div>
                    <div className="text-xs text-muted-foreground">Qualité certifiée</div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-8">
                <div className="relative">
                  <h3 className="text-foreground font-display text-2xl mb-6">Description du produit</h3>
                  
                  {/* Arabic Description */}
                  {product.descriptionAr && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="whitespace-pre-line leading-relaxed text-xl font-medium text-foreground text-right border-r-4 border-primary pr-6 py-2" 
                      dir="rtl"
                    >
                      {product.descriptionAr}
                    </motion.p>
                  )}

                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground mt-6">
                    {product.description || "Un produit d'exception conçu pour répondre à vos besoins avec élégance et performance."}
                  </p>
                </div>

                {/* Description Media (Images/Videos) */}
                {product.descriptionMedia && Array.isArray(product.descriptionMedia) && product.descriptionMedia.length > 0 && (
                  <div className="mt-16 space-y-16">
                    <div className="flex items-center gap-4">
                       <h3 className="text-muted-foreground font-display text-xs uppercase tracking-[0.3em] font-medium whitespace-nowrap">Expérience Visuelle</h3>
                       <div className="h-[1px] flex-1 bg-gradient-to-r from-border to-transparent"></div>
                    </div>

                    <div className="space-y-16 sm:space-y-24">
                      {(product.descriptionMedia as any[]).map((media, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.7 }}
                          className="relative group rounded-[2.5rem] overflow-hidden border border-border/40 bg-secondary/10 shadow-2xl transition-all duration-500 hover:shadow-primary/5"
                        >
                          {media.type === "video" ? (
                            <video 
                              src={getSafeImageUrl(media.url)} 
                              autoPlay muted loop playsInline controls
                              className="w-full h-auto max-h-[750px] object-cover"
                            />
                          ) : (
                            <img 
                              src={getSafeImageUrl(media.url)} 
                              alt=""
                              className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-[3s]"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Specs */}
                {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
                  <div className="mt-12">
                     <h3 className="text-foreground font-display text-2xl mb-6">Caractéristiques</h3>
                     <div className="bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm">
                        {Object.entries(product.specs as Record<string, any>).map(([key, value], i) => (
                           <div key={key} className={cn("grid grid-cols-3 p-5", i % 2 === 0 ? "bg-secondary/20" : "")}>
                               <div className="font-bold text-foreground capitalize text-sm sm:text-base">{key}</div>
                               <div className="col-span-2 text-muted-foreground text-sm sm:text-base">{String(value)}</div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
                {/* Reviews Section */}
                <div className="mt-24 pt-16 border-t border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <div>
                      <h3 className="text-muted-foreground font-display text-xs uppercase tracking-[0.3em] font-medium mb-3">Retours Expérience</h3>
                      <h2 className="text-4xl font-display font-bold text-foreground">Avis de nos clients</h2>
                    </div>
                    {product.averageRating && (
                      <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-3xl border border-border/40">
                        <div className="text-4xl font-bold text-primary">{Number(product.averageRating).toFixed(1)}</div>
                        <div>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-4 h-4 fill-current", i >= Math.round(Number(product.averageRating) || 0) && "text-muted/30 fill-none")} />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Basé sur {product.reviewCount || 0} avis</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <ReviewsContainer productId={product.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}

function ReviewsContainer({ productId }: { productId: number }) {
  const { data: reviews, isLoading } = useListReviews({ productId });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center p-16 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border/60">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {reviews.map((review: any, idx: number) => (
        <motion.div
           key={review.id}
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: idx * 0.1 }}
           className="bg-card/40 backdrop-blur-md border border-border/60 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-lg">
                {review.customerName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-foreground flex items-center gap-2">
                  {review.customerName}
                  <Badge variant="success" className="bg-green-500/10 text-green-600 border-none text-[10px] px-2">Vérifié</Badge>
                </div>
                <div className="flex text-yellow-500 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i >= review.rating ? "text-muted/30 fill-none" : "")} />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full uppercase tracking-wider">
              {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed italic mb-6">
            "{review.comment}"
          </p>

          {review.media && Array.isArray(review.media) && review.media.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
              {review.media.map((m: any, i: number) => (
                <div key={i} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border border-border/40 shrink-0 group">
                  {m.type === "video" ? (
                    <>
                      <video src={getSafeImageUrl(m.url)} className="w-full h-full object-cover" muted playsInline />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </>
                  ) : (
                    <img src={getSafeImageUrl(m.url)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Avis client" />
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={className}
  >
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </motion.div>
);
