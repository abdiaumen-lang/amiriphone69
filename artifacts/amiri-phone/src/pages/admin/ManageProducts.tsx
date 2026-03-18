import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Button, Badge } from "@/components/UI";
import { formatDZD } from "@/lib/utils";
import { useListProducts, useDeleteProduct } from "@workspace/api-client-react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ManageProducts() {
  const { data: productsData, isLoading } = useListProducts({ limit: 100 });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: deleteProduct } = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        toast({ title: "Produit supprimé", variant: "default" });
      }
    }
  });

  const handleDelete = (id: number) => {
    if(confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProduct({ id });
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Produits</h1>
          <p className="text-muted-foreground mt-2">Gérez le catalogue de la boutique.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-5 h-5" /> Ajouter un produit
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-muted-foreground">Produit</th>
                <th className="p-4 font-semibold text-muted-foreground">Prix</th>
                <th className="p-4 font-semibold text-muted-foreground">Stock</th>
                <th className="p-4 font-semibold text-muted-foreground">Statut</th>
                <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Chargement...</td></tr>
              ) : productsData?.products.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0] || ""} alt="" className="w-12 h-12 rounded-lg object-contain bg-secondary p-1" />
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{formatDZD(product.price)}</td>
                  <td className="p-4">
                    <span className={product.stock < 5 ? "text-destructive font-bold" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    {product.stock > 0 ? <Badge variant="success">En stock</Badge> : <Badge variant="danger">Rupture</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
