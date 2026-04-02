import React, { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/UI";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Star, Search, Loader2, Video, Image as ImageIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useListProducts, useListReviews, useCreateReview } from "@workspace/api-client-react";
import { cn, getSafeImageUrl } from "@/lib/utils";

export default function ManageReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // New Review Form State
  const [newReview, setNewReview] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    media: [] as { type: "image" | "video"; url: string }[],
  });

  // Fetch Products for selection
  const { data: productsData } = useListProducts({ 
    params: { search: searchTerm, limit: 10 } 
  });

  // Fetch Reviews for selected product
  const { data: reviews, isLoading: isLoadingReviews } = useListReviews(
    { productId: selectedProduct?.id || 0 },
    { query: { enabled: !!selectedProduct } }
  );

  const { mutate: createReview, isPending: isCreating } = useCreateReview({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
        toast({ title: "Succès", description: "Le commentaire a été ajouté." });
        setIsAddingReview(false);
        setNewReview({ customerName: "", rating: 5, comment: "", media: [] });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Erreur", description: err.message || "Impossible d'ajouter le commentaire." });
      },
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      const isVideo = file.type.startsWith("video/");
      
      if (data.url) {
        setNewReview(prev => ({
          ...prev,
          media: [...prev.media, { type: isVideo ? "video" : "image", url: data.url }]
        }));
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload failed", description: "Impossible de télécharger le fichier." });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!selectedProduct) return;
    if (!newReview.customerName || !newReview.comment) {
      toast({ variant: "destructive", title: "Incomplet", description: "Veuillez remplir tous les champs." });
      return;
    }
    createReview({
      data: {
        ...newReview,
        productId: selectedProduct.id,
      } as any
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Product Selection */}
        <Card className="border-primary/20 shadow-lg bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Sélectionner un Produit pour gérer les avis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Rechercher un produit (ex: iPhone 15)..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedProduct) setSelectedProduct(null);
                }}
                className="pl-10 h-12 text-lg"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>

            {productsData?.products && searchTerm && !selectedProduct && (
              <div className="border rounded-xl mt-2 overflow-hidden bg-background shadow-xl divide-y z-20 relative">
                {productsData.products.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSearchTerm("");
                    }}
                    className="w-full p-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors text-left"
                  >
                    <img src={getSafeImageUrl(p.images[0])} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.price.toLocaleString()} DA</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <img src={getSafeImageUrl(selectedProduct.images[0])} className="w-16 h-16 rounded-xl object-cover shadow-md" alt="" />
                  <div>
                    <h3 className="font-bold text-lg">{selectedProduct.name}</h3>
                    <p className="text-sm text-primary/80">Affichage des commentaires ({reviews?.length || 0})</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>Changer</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Commentaires Clients</h2>
              <Button onClick={() => setIsAddingReview(!isAddingReview)} className="rounded-full shadow-lg shadow-primary/20">
                {isAddingReview ? "Annuler" : <><Plus className="w-4 h-4 mr-2" /> Ajouter un Avis</>}
              </Button>
            </div>

            {isAddingReview && (
              <Card className="border-primary shadow-xl animate-in zoom-in-95 duration-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom du Client</label>
                      <Input 
                        placeholder="Ex: Ahmed Benali" 
                        value={newReview.customerName}
                        onChange={e => setNewReview({ ...newReview, customerName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Note (1-5)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              newReview.rating >= star ? "text-yellow-400 scale-110" : "text-gray-300"
                            )}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaire</label>
                    <Textarea 
                      placeholder="Excellent produit, livraison rapide..." 
                      className="min-h-[100px]"
                      value={newReview.comment}
                      onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                  </div>

                  {/* Media Upload */}
                  <div className="space-y-4 pt-2">
                    <label className="text-sm font-medium block">Photos & Vidéos du client</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {newReview.media.map((m: any, i: number) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border shadow-sm flex items-center justify-center bg-secondary/20">
                          {m.type === "video" ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <img src={getSafeImageUrl(m.url)} className="w-full h-full object-cover" alt="" />
                          )}
                          <button 
                            onClick={() => removeMedia(i)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ))}
                      
                      <label className={cn(
                        "aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5",
                        isUploading && "pointer-events-none opacity-50"
                      )}>
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-6 h-6 text-muted-foreground" />
                            <span className="text-[10px] mt-1 font-medium">Fichier</span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e)} />
                      </label>
                    </div>
                  </div>

                  <Button onClick={handleSubmit} className="w-full h-12 text-lg font-bold" disabled={isCreating}>
                    {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Enregistrer l'Avis client
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {isLoadingReviews ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((r: any) => (
                  <Card key={r.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-lg flex items-center gap-2">
                            {r.customerName}
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vérifié</span>
                          </div>
                          <div className="flex text-yellow-400 mt-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-muted-foreground mt-3 italic">"{r.comment}"</p>
                      
                      {r.media && r.media.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {r.media.map((m: any, i: number) => (
                            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border bg-secondary/10 relative group bg-black/5">
                               {m.type === "video" ? (
                                 <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                   <Video className="w-5 h-5 text-white" />
                                 </div>
                               ) : (
                                 <img src={getSafeImageUrl(m.url)} className="w-full h-full object-cover" alt="" />
                               )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center p-12 bg-secondary/10 rounded-3xl border-2 border-dashed">
                  <p className="text-muted-foreground">Aucun avis pour cet article pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
