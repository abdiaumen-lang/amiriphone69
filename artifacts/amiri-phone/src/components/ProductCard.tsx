import { Link } from "wouter";
import { formatDZD } from "@/lib/utils";
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
    <Link href={`/products/${product.id}`} className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
      
      <div className="relative aspect-[4/5] bg-secondary/50 p-6 overflow-hidden flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.onSale && product.discount && (
            <Badge variant="danger" className="shadow-sm">-{product.discount}%</Badge>
          )}
          {product.featured && (
            <Badge variant="default" className="shadow-sm bg-primary text-white">Populaire</Badge>
          )}
        </div>

        {/* Image */}
        {/* Using unsplash placeholder if image array is empty for stunning UI */}
        {/* smartphone product shot */}
        <img 
          src={product.images?.[0] || "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80"} 
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        />

        {/* Quick Add Button (visible on hover) */}
        <div className="absolute bottom-4 inset-x-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button size="sm" className="w-full rounded-full gap-2 shadow-lg" onClick={handleAdd}>
            <ShoppingCart className="w-4 h-4" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground font-medium mb-1">
          {product.brand || "Smartphone"}
        </div>
        <h3 className="font-semibold text-foreground leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <div className="font-display font-bold text-lg text-primary">
              {formatDZD(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-muted-foreground line-through">
                {formatDZD(product.originalPrice)}
              </div>
            )}
          </div>
          
          {product.stock > 0 && product.stock < 5 && (
            <div className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full animate-pulse">
              Plus que {product.stock}!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
