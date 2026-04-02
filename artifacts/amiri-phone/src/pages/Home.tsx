import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { AppLayout } from "@/components/Layout";
import { Button, PageTransition, ProductSkeleton, Card, Badge } from "@/components/UI";
import { ProductCard } from "@/components/ProductCard";
import { 
  ArrowRight, ShieldCheck, Zap, Headphones, CheckCircle, 
  ChevronRight, Star, ShoppingBag, Smartphone, FolderTree
} from "lucide-react";
import { useListProducts, useGetSettings, useListCategories } from "@workspace/api-client-react";
import { formatDZD, cn, getSafeImageUrl } from "@/lib/utils";

function Ticker({ images, speed = 30, height = 64 }: { images: string[]; speed?: number, height?: number }) {
  if (!images || images.length === 0) return null;
  
  // Duplicate images to ensure a long enough track for seamless looping
  const displayImages = [...images, ...images, ...images];
  
  // Calculate a responsive speed based on the number of images
  const calculatedSpeed = speed || (images.length * 5);

  return (
    <div className="relative py-8 md:py-12 bg-secondary/30 border-y border-border overflow-hidden">
      {/* Premium Side Fades */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background via-background/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background via-background/40 to-transparent z-10 pointer-events-none" />
      
      <div 
        className="flex gap-10 md:gap-20 animate-marquee whitespace-nowrap min-w-max"
        style={{ animationDuration: `${calculatedSpeed}s` }}
      >
        {displayImages.map((src, i) => (
          <div key={i} className="flex-shrink-0 flex items-center justify-center transition-all duration-300">
            <img 
              src={getSafeImageUrl(src)} 
              alt="Brand/Partner" 
              className="w-auto object-contain px-2 md:px-4 hover:scale-110 transition-transform duration-500 h-8 md:h-16 opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
              style={{ height: height ? `${height}px` : undefined }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featuredProducts, isLoading } = useListProducts({ featured: true, limit: 8 });
  const { data: categoriesData } = useListCategories();
  const categories = categoriesData || [];
  const { data: latestProductsData } = useListProducts({ limit: 1 });
  const latestProducts = latestProductsData?.products || [];

  const { data } = useGetSettings();
  const settings = data as Record<string, any> | undefined;
  const content = settings?.pageContent || {};
  const features = settings?.features || {};
  const hero = content.hero || {};

  return (
    <AppLayout>
      <PageTransition>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
              style={{ 
                filter: `blur(${settings?.heroVideoBlur ?? 0}px)`,
                opacity: settings?.heroVideoOpacity !== undefined ? (1 - settings.heroVideoOpacity) : 0.6
              }}
              onEnded={(e) => {
                (e.target as HTMLVideoElement).currentTime = 0;
                (e.target as HTMLVideoElement).play();
              }}
            >
              <source src={`${import.meta.env.BASE_URL}videos/hero-background.mp4`} type="video/mp4" />
            </video>
            {/* Dynamic Overlay for better text readability */}
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: settings?.heroVideoOpacity ?? 0.4 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="container mx-auto px-4 mt-20 md:mt-0 pb-16 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                  {hero.badge || "Nouveaux Arrivages Apple & Samsung"}
                </Badge>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[1.1] md:leading-[1.05]">
                  {hero.title1 || "L'excellence"}<br />
                  <span className="text-primary">{hero.title2 || "Technologique"}</span><br />
                  {hero.title3 || "En Algérie."}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  {hero.subtitle || "Découvrez la meilleure sélection de smartphones premium chez Amiri Phone."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 group">
                      {hero.cta1 || "Voir le catalogue"} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <a href="#contact">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl border-2">
                      {hero.cta2 || "Contactez-nous"}
                    </Button>
                  </a>
                </div>

                <div className="pt-6 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center overflow-hidden">
                        <img src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&auto=format&fit=crop&facepad=2&crop=face`} className="w-full h-full object-cover" alt="Client"/>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex text-[#FF9500]">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm font-medium mt-1">+{content.reviews?.count || "1,000"} clients satisfaits</p>
                  </div>
                </div>
              </div>

              <div className="relative group perspective-1000 hidden lg:block animate-in fade-in slide-in-from-right duration-1000">
                <div className="relative z-10 transition-transform duration-500 group-hover:rotate-y-6 group-hover:rotate-x-2">
                  <Card className="p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
                    <img 
                      src={getSafeImageUrl(latestProducts[0]?.images[0] || "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80")} 
                      alt="Latest Flagship"
                      className="w-full aspect-[4/5] object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                      <div className="text-sm font-medium mb-1 opacity-80">Nouveau</div>
                      <div className="text-2xl font-bold mb-2">{latestProducts[0]?.name || "iPhone 15 Pro Max"}</div>
                      <div className="flex items-center gap-2 text-primary font-bold">
                        {formatDZD(latestProducts[0]?.price || 345000)}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 blur-[80px] rounded-full animate-pulse delay-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Section */}
        <Ticker 
          images={settings?.tickerImages || []} 
          speed={settings?.tickerSpeed} 
          height={settings?.tickerImageSize} 
        />

        {/* Trust Badges */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { key: "trust1", icon: ShieldCheck, def: "Garantie Qualité", sub: "Produits 100% originaux" },
                { key: "trust2", icon: Zap, def: "Livraison Rapide", sub: "Vers les 48 Wilayas" },
                { key: "trust3", icon: CheckCircle, def: "Paiement Sécurisé", sub: "Paiement à la livraison" },
                { key: "trust4", icon: Headphones, def: "Support Client", sub: "7j/7 jusqu'à 23h30" },
              ].map(({ key, icon: Icon, def, sub }) => (
                <div key={key} className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-lg">{content[key]?.title || def}</h3>
                  <p className="text-sm text-muted-foreground">{content[key]?.subtitle || sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Google Maps Embed */}
        {settings?.googleMapsUrl && (
          <section className="py-12 bg-background border-y border-border">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-display font-bold mb-6">Notre Position</h2>
              <div className="w-full h-80 md:h-96 rounded-3xl overflow-hidden bg-secondary border border-border grayscale shadow-xl hover:grayscale-0 transition-all duration-500">
                <iframe 
                  src={settings.googleMapsUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </section>
        )}

        {/* 3D Categories Carousel */}
        <section className="py-24 overflow-hidden bg-secondary/5 border-y border-border relative">
          <div className="container mx-auto px-4 mb-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight">Explorer par <span className="text-primary italic">Catégorie</span></h2>
              <p className="text-muted-foreground text-lg">Sélectionnez votre univers technologique avec style.</p>
            </div>
          </div>

          <div className="flex justify-center items-center py-10 relative">
            {/* Custom Horizontal Scroll with 3D Effect */}
            <div className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar snap-x snap-center px-[10%] md:px-[25%] py-10 mask-fade-edges scroll-smooth">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="snap-center shrink-0 w-72 md:w-72 group/cat"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      type: "spring",
                      stiffness: 100,
                      delay: i * 0.05 
                    } 
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <Link href={`/products?category=${cat.name}`}>
                    <div className="relative aspect-[4/5] w-full rounded-[3.5rem] bg-card border border-border/50 p-6 flex flex-col items-center justify-between overflow-hidden transition-all duration-700 group-hover/cat:border-primary/40 group-hover/cat:shadow-[0_40px_80px_rgba(0,122,255,0.2)] group-hover/cat:-translate-y-6">
                      {/* Premium Glassmorphism & Lighting */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/cat:opacity-100 transition-opacity duration-1000" />
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px] group-hover/cat:bg-primary/20 transition-colors" />
                      
                      <div className="flex-1 flex items-center justify-center w-full relative">
                        <div className="relative w-40 h-40 md:w-56 md:h-56 transition-all duration-1000 ease-out group-hover/cat:scale-125 group-hover/cat:[transform:perspective(2000px)_rotateY(15deg)_rotateX(5deg)_translateZ(80px)]">
                          {cat.icon ? (
                            <img 
                              src={getSafeImageUrl(cat.icon)} 
                              alt={cat.name} 
                              className="w-full h-full object-contain drop-shadow-[0_40px_70px_rgba(0,0,0,0.4)] filter brightness-110" 
                            />
                          ) : (
                            <FolderTree className="w-24 h-24 text-primary/20" />
                          )}
                        </div>
                      </div>

                      <div className="w-full text-center space-y-1 py-3 z-10 bg-background/40 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl transition-transform duration-700 group-hover/cat:translate-y-1 mb-2">
                        <h3 className="font-display font-black text-lg md:text-xl tracking-tight">
                          {cat.nameAr || cat.name}
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/cat:bg-primary transition-colors" />
                          <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                            {cat.productCount} Modèle{cat.productCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indication Icons (Optional) */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center border border-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center border border-border pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 mt-8 flex justify-center">
            <Link href="/products">
              <Button variant="outline" size="md" className="rounded-xl border-2 font-bold group px-6 h-12 text-sm md:text-base bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all">
                Explorer Tout <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-secondary/30 relative overflow-hidden group/featured">
          {/* Section Video Background */}
          {settings?.featuredVideoUrl && (
            <div className="absolute inset-0 -z-10">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover transition-opacity duration-1000"
                style={{ 
                  filter: `blur(${settings?.featuredVideoBlur ?? 0}px)`,
                  opacity: 1 - (settings?.featuredVideoOpacity ?? 0.3)
                }}
              >
                <source src={settings.featuredVideoUrl} type="video/mp4" />
              </video>
              <div 
                className="absolute inset-0 bg-black" 
                style={{ opacity: settings?.featuredVideoOpacity ?? 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>
          )}
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className={cn(settings?.featuredVideoUrl ? "text-white" : "text-foreground")}>
                <h2 className="text-4xl md:text-5xl font-display font-bold">Coups de Coeur</h2>
                <p className={cn("mt-2 text-lg", settings?.featuredVideoUrl ? "text-white/70" : "text-muted-foreground")}>Sélectionnés avec soin pour vous.</p>
              </div>
              <Link href="/products">
                <Button variant={settings?.featuredVideoUrl ? "outline" : "ghost"} className={cn("font-bold rounded-xl group", settings?.featuredVideoUrl ? "text-white border-white/20 hover:bg-white/10" : "text-primary hover:bg-primary/5")}>
                  Voir plus <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : featuredProducts?.products && featuredProducts.products.length > 0 ? (
                featuredProducts.products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-dashed border-border">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Boutique en cours de mise à jour...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {features.reviewsSection !== false && (
          <section className="py-32 bg-foreground text-background overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full filter blur-[120px]" />
               <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full filter blur-[120px]" />
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-foreground/80 text-sm font-semibold mb-6">
                  <Star className="w-4 h-4 fill-primary text-primary" /> Note moyenne: 4.9/5
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
                  {content.reviews?.title || "Ce que disent nos clients"}
                </h2>
                <p className="text-background/60 text-xl leading-relaxed">
                  Rejoignez des milliers de clients satisfاits qui nous font confiance pour leurs besoins technologiques.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: "Mohamed A.", city: "Alger", text: "Les meilleurs produits Apple 💪 Prix imbattable et service au top. Je recommande vivement !" },
                  { name: "Fatima B.", city: "Oran", text: "Bon rapport qualité prix. J'ai acheté un S24 Ultra, livraison en 24h. Parfait." },
                  { name: "Karim D.", city: "Sétif", text: "Vendeur très professionnel. J'ai eu un conseil personnalisé pour le choix de mon téléphone." }
                ].map((review, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 relative group hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{review.name}</h4>
                        <p className="text-xs text-white/40 font-medium">{review.city}</p>
                      </div>
                    </div>
                    <p className="text-background/70 leading-relaxed text-lg font-medium italic">"{review.text}"</p>
                    <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Star className="w-12 h-12 fill-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </PageTransition>
    </AppLayout>
  );
}
