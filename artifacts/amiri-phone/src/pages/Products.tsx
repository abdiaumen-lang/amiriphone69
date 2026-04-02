import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Input, Select, ProductSkeleton, Button } from "@/components/UI";
import { ProductCard } from "@/components/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const { data: categoriesData } = useListCategories();
  
  // Real API fetching with debounced/current state
  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    category: category || undefined,
    limit: 50
  });

  // Client side sorting since API might not support it directly based on schema
  const sortedProducts = productsData?.products ? [...productsData.products] : [];
  if (sort === "price_asc") sortedProducts.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") sortedProducts.sort((a, b) => b.price - a.price);
  if (sort === "newest") sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <AppLayout>
      <PageTransition>
        <div className="bg-secondary/30 border-b border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Notre Catalogue</h1>
            <p className="text-muted-foreground max-w-2xl">Trouvez le smartphone parfait parmi notre large sélection de grandes marques.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0 space-y-8">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher un modèle..." 
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 font-semibold mb-4">
                  <SlidersHorizontal className="w-5 h-5" /> Filtres
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="cat" checked={category === ""} onChange={() => setCategory("")} className="text-primary focus:ring-primary" />
                        <span className="text-sm">Toutes</span>
                      </label>
                      {Array.isArray(categoriesData) && categoriesData.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="cat" 
                            checked={category === cat.slug} 
                            onChange={() => setCategory(cat.slug)} 
                            className="text-primary focus:ring-primary" 
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))}
                      {/* Fallback hardcoded if api is empty initially */}
                      {(!Array.isArray(categoriesData) || !categoriesData.length) && ["Smartphones", "Accessoires", "Audio"].map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="cat" checked={category === c.toLowerCase()} onChange={() => setCategory(c.toLowerCase())} className="text-primary focus:ring-primary" />
                          <span className="text-sm">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-medium text-muted-foreground">
                  {isLoading ? "Chargement..." : `${sortedProducts.length} produits trouvés`}
                </p>
                <div className="w-48">
                  <Select 
                    options={[
                      { value: "newest", label: "Plus récents" },
                      { value: "price_asc", label: "Prix: Croissant" },
                      { value: "price_desc", label: "Prix: Décroissant" }
                    ]}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
                ) : sortedProducts.length > 0 ? (
                  sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                    <p className="text-muted-foreground">Essayez de modifier vos filtres de recherche.</p>
                    <Button variant="outline" className="mt-6" onClick={() => {setSearch(""); setCategory("");}}>Réinitialiser les filtres</Button>
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
