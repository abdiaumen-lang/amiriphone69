import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Input, Select, Button, Card } from "@/components/UI";
import { formatDZD, getSafeImageUrl } from "@/lib/utils";
import { useCart } from "@/store/Store";
import { useToast } from "@/hooks/use-toast";
import { useListWilayas, useListCommunes, getListCommunesQueryKey, useCreateOrder } from "@workspace/api-client-react";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: wilayas } = useListWilayas();
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerPhone2: "",
    wilayaCode: "",
    communeCode: "",
    address: "",
    notes: ""
  });

  const { data: communes } = useListCommunes(formData.wilayaCode, { 
    query: { enabled: !!formData.wilayaCode, queryKey: getListCommunesQueryKey(formData.wilayaCode) } 
  });

  const selectedWilayaObj = wilayas?.find(w => w.code === formData.wilayaCode);
  const shippingCost = selectedWilayaObj?.shippingCost || 0;
  const total = subtotal + shippingCost;

  const { mutate: createOrder, isPending } = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        clearCart();
        setLocation(`/order-success?orderNumber=${data.orderNumber}`);
      },
      onError: (err: any) => {
        toast({
          title: "Erreur",
          description: err.message || "Impossible de créer la commande. Veuillez vérifier vos informations.",
          variant: "destructive"
        });
      }
    }
  });

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.wilayaCode || !formData.communeCode) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    const wilayaName = wilayas?.find(w => w.code === formData.wilayaCode)?.name || "";
    const communeName = communes?.find(c => c.code === formData.communeCode)?.name || "";

    createOrder({
      data: {
        ...formData,
        wilayaName,
        communeName,
        items: items.map(item => ({ productId: item.product.id, quantity: item.quantity }))
      }
    });
  };

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Validation de commande</h1>
            <p className="text-muted-foreground mt-2">Veuillez entrer vos informations de livraison.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <Card className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold mb-2">Informations personnelles</h2>
                <Input 
                  label="Nom complet *" 
                  required 
                  placeholder="ex: Mohamed Amine"
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input 
                    label="Numéro de téléphone *" 
                    required 
                    type="tel"
                    placeholder="ex: 0555 12 34 56"
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                  />
                  <Input 
                    label="Téléphone 2 (Optionnel)" 
                    type="tel"
                    value={formData.customerPhone2}
                    onChange={e => setFormData({...formData, customerPhone2: e.target.value})}
                  />
                </div>
              </Card>

              <Card className="p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-semibold mb-2">Adresse de livraison</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Wilaya *"
                    required
                    options={wilayas?.map(w => ({ value: w.code, label: `${w.code} - ${w.name}` })) || []}
                    value={formData.wilayaCode}
                    onChange={e => setFormData({...formData, wilayaCode: e.target.value, communeCode: ""})}
                  />
                  <Select
                    label="Commune *"
                    required
                    disabled={!formData.wilayaCode}
                    options={communes?.map(c => ({ value: c.code, label: c.name })) || []}
                    value={formData.communeCode}
                    onChange={e => setFormData({...formData, communeCode: e.target.value})}
                  />
                </div>
                <Input 
                  label="Adresse détaillée *" 
                  required 
                  placeholder="Cité, Rue, N° Bâtiment..."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Remarque (Optionnel)</label>
                  <textarea 
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary transition-all resize-none"
                    rows={3}
                    placeholder="Instructions pour le livreur..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </Card>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-4">
                <div className="bg-primary text-white p-2 rounded-full mt-1 shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-primary">Paiement à la livraison</h4>
                  <p className="text-sm text-muted-foreground mt-1">Vous ne payez qu'à la réception de votre commande. Aucun paiement en ligne requis.</p>
                </div>
              </div>
            </form>

            {/* Summary */}
            <div>
              <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 sticky top-32 shadow-lg shadow-black/5">
                <h3 className="text-2xl font-display font-bold mb-6">Votre commande</h3>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                        <img src={getSafeImageUrl(item.product.images?.[0]) || ""} alt={item.product.name} className="w-full h-full object-contain drop-shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm line-clamp-1">{item.product.name}</div>
                        <div className="text-xs text-muted-foreground">Qté: {item.quantity}</div>
                      </div>
                      <div className="font-medium text-sm">
                        {formatDZD(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-6 space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{formatDZD(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison {wilayas?.find(w => w.code === formData.wilayaCode)?.name && `(${wilayas.find(w => w.code === formData.wilayaCode)?.name})`}</span>
                    <span className="font-semibold">{shippingCost ? formatDZD(shippingCost) : "À calculer"}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-border mt-4">
                    <span className="font-bold text-base">Total à payer</span>
                    <span className="font-display font-bold text-3xl text-primary">{formatDZD(total)}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg mt-8 rounded-2xl shadow-xl"
                  onClick={handleSubmit}
                  isLoading={isPending}
                >
                  Confirmer la commande
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
