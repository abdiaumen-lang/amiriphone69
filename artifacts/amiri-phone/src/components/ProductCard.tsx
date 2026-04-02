import { Link } from "wouter";
import { formatDZD, getSafeImageUrl } from "@/lib/utils";
import type { Product } from "@workspace/api-client-react";
import { Badge, Button } from "./UI";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/Store";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    addItem(product);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté avec succès.`,
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col bg-card rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-border/50">
      
      <div className="relative aspect-[4/5] bg-secondary/20 overflow-hidden w-full">
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1.5 z-10">
          {product.onSale && product.discount && (
            <Badge variant="danger" className="shadow-md px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-[10px] sm:text-sm">-{product.discount}%</Badge>
          )}
          {product.featured && (
            <Badge variant="default" className="shadow-md bg-primary text-white px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-[10px] sm:text-sm">Nouveau</Badge>
          )}
        </div>

        {/* Image */}
        <img 
          src={getSafeImageUrl(product.images?.[0]) || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1 bg-white">
        {product.brand && (
          <div className="text-[10px] sm:text-xs text-muted-foreground font-bold mb-1.5 sm:mb-2 uppercase tracking-wide">
            {product.brand}
          </div>
        )}
        
        <h3 className="font-display font-semibold text-foreground text-sm sm:text-xl leading-snug mb-3 sm:mb-4 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto flex flex-col gap-3 sm:gap-5">
          <div className="flex flex-col">
            <div className="font-display font-bold text-lg sm:text-2xl tracking-tight text-foreground">
              {formatDZD(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs sm:text-sm text-muted-foreground line-through mt-0.5">
                {formatDZD(product.originalPrice)}
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full rounded-xl sm:rounded-2xl border-2 border-foreground/10 font-bold h-10 sm:h-12 text-xs sm:text-base group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all shadow-sm"
            onClick={handleAdd}
          >
            <span className="hidden sm:inline">Ajouter au panier</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </div>
    </Link>
  );
}
