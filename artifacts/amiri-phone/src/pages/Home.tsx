import { Link } from "wouter";
import { AppLayout } from "@/components/Layout";
import { Button, PageTransition, ProductSkeleton } from "@/components/UI";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Star, ShieldCheck, Zap, Headphones, Smartphone } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";

export default function Home() {
  const { data: featuredProducts, isLoading } = useListProducts({ featured: true, limit: 8 });
  const { data: saleProducts } = useListProducts({ onSale: true, limit: 4 });

  return (
    <AppLayout>
      <PageTransition>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-10 pb-20 overflow-hidden">
          {/* Background generated image */}
          <div className="absolute inset-0 -z-10">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="Premium Background" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Nouveaux Arrivages Apple & Samsung
                </div>
                
                <h1 className="text-5xl md:text-7xl font-display font-extrabold text-foreground leading-[1.1]">
                  L'excellence <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
                    Technologique
                  </span><br/>
                  En Algérie.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Découvrez la meilleure sélection de smartphones premium chez Amiri Phone. Des prix imbattables, une garantie solide et un service client exceptionnel à Bir Mourad Raïs.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto rounded-full group">
                      Voir le catalogue
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full bg-background/50 backdrop-blur-sm">
                    Contactez-nous
                  </Button>
                </div>

                <div className="pt-6 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center overflow-hidden">
                        {/* portrait user */}
                        <img src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&auto=format&fit=crop&facepad=2&crop=face`} className="w-full h-full object-cover" alt="Client"/>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex text-[#FF9500]">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm font-medium mt-1">+1,000 clients satisfaits</p>
                  </div>
                </div>
              </div>

              {/* Hero Image / Composition */}
              <div className="relative hidden lg:block h-[600px] animate-in fade-in slide-in-from-right-12 duration-1000">
                  {/* floating smartphone composition */}
                  <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&q=80" alt="Iphone 15 Pro" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] rounded-[3rem] shadow-2xl rotate-[-5deg] z-20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Trust */}
        <section className="py-12 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Garantie Qualité</h3>
                <p className="text-sm text-muted-foreground">Produits 100% originaux</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Livraison Rapide</h3>
                <p className="text-sm text-muted-foreground">Vers les 48 Wilayas</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="font-semibold">Paiement Sécurisé</h3>
                <p className="text-sm text-muted-foreground">Paiement à la livraison</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Support Client</h3>
                <p className="text-sm text-muted-foreground">7j/7 jusqu'à 23h30</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-center mb-12">Explorer par Catégorie</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Smartphones", icon: Smartphone, color: "bg-blue-50 text-blue-600" },
                { name: "Accessoires", icon: Headphones, color: "bg-purple-50 text-purple-600" },
                { name: "Coques", icon: ShieldCheck, color: "bg-orange-50 text-orange-600" },
                { name: "Chargeurs", icon: Zap, color: "bg-emerald-50 text-emerald-600" },
              ].map((cat, i) => (
                <Link key={i} href={`/products?category=${cat.name.toLowerCase()}`} className="group relative bg-card border border-border p-8 rounded-3xl text-center hover:shadow-xl hover:border-primary/30 transition-all">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">Populaire chez Amiri</h2>
                <p className="text-muted-foreground">Les modèles les plus demandés du moment.</p>
              </div>
              <Link href="/products">
                <Button variant="ghost" className="hidden sm:flex">Voir tout <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              ) : featuredProducts?.products && featuredProducts.products.length > 0 ? (
                featuredProducts.products.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  Boutique en cours de mise à jour...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-24 bg-foreground text-background overflow-hidden relative">
          {/* Abstract mesh background */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full mix-blend-screen filter blur-[100px]"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="flex justify-center mb-6 text-[#FF9500]">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-8 h-8 fill-current" />)}
              </div>
              <h2 className="text-4xl font-display font-bold mb-4">Ce que disent nos clients</h2>
              <p className="text-background/70 text-lg">Rejoignez des milliers de clients satisfaits partout en Algérie.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Mohamed A.", text: "Les meilleurs produits Apple 💪 Prix imbattable et service au top. Je recommande vivement !" },
                { name: "Fatima B.", text: "Bon rapport qualité prix. J'ai acheté un S24 Ultra, livraison en 24h à Oran. Parfait." },
                { name: "Karim D.", text: "Vendeur très professionnel. J'ai eu un conseil personnalisé pour le choix de mon téléphone." }
              ].map((review, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex text-[#FF9500] mt-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-background/80 leading-relaxed">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </PageTransition>
    </AppLayout>
  );
}
