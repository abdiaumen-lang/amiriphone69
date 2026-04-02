import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Button, Badge } from "@/components/UI";
import { formatDZD } from "@/lib/utils";
import { useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import type { Order } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { X, ChevronDown, Package, Truck, CheckCircle, RotateCcw, XCircle, Clock, Eye } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: "En attente",   color: "text-orange-600 bg-orange-50 border-orange-200",   icon: Clock },
  confirmed:  { label: "Confirmé",     color: "text-blue-600 bg-blue-50 border-blue-200",          icon: Package },
  processing: { label: "En cours",     color: "text-purple-600 bg-purple-50 border-purple-200",    icon: Package },
  shipped:    { label: "Expédié",      color: "text-indigo-600 bg-indigo-50 border-indigo-200",    icon: Truck },
  delivered:  { label: "Livré",        color: "text-green-600 bg-green-50 border-green-200",       icon: CheckCircle },
  returned:   { label: "Retourné",     color: "text-yellow-600 bg-yellow-50 border-yellow-200",    icon: RotateCcw },
  cancelled:  { label: "Annulé",       color: "text-red-600 bg-red-50 border-red-200",             icon: XCircle },
};

const STATUS_FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function OrderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [deliveryCompany, setDeliveryCompany] = useState(order.deliveryCompany || "");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: updateStatus, isPending } = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        toast({ title: "Commande mise à jour" });
        onClose();
      },
      onError: () => toast({ title: "Erreur", variant: "destructive" }),
    },
  });

  const handleSave = () => {
    updateStatus({ id: order.id, data: { status: status as any, notes, deliveryCompany, trackingNumber } });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Commande #{order.orderNumber}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{new Date(order.createdAt).toLocaleString("fr-DZ")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Client</div>
              <div className="font-bold text-lg">{order.customerName}</div>
              <div className="text-primary font-medium">{order.customerPhone}</div>
              {order.customerPhone2 && <div className="text-muted-foreground text-sm">{order.customerPhone2}</div>}
            </div>
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Adresse</div>
              <div className="font-semibold">{order.wilayaName}</div>
              {order.communeName && <div className="text-muted-foreground">{order.communeName}</div>}
              {order.address && <div className="text-sm text-muted-foreground mt-1">{order.address}</div>}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Produits</div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 px-4 bg-secondary/30 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    {item.productImage && <img src={item.productImage} className="w-10 h-10 object-contain rounded-lg bg-background" />}
                    <div>
                      <div className="font-medium text-sm">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">Qté: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold">{formatDZD(item.total)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{formatDZD(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span>{formatDZD(order.shippingCost)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-border"><span>Total</span><span className="text-primary">{formatDZD(order.total)}</span></div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Statut</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key as any)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${status === key ? cfg.color + " ring-2 ring-offset-1" : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Transporteur</label>
                <input value={deliveryCompany} onChange={e => setDeliveryCompany(e.target.value)} placeholder="Yalidine, ZR Express..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">N° Suivi</label>
                <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Numéro de tracking..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Notes internes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes visibles uniquement en admin..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} isLoading={isPending} className="flex-1">Enregistrer</Button>
        </div>
      </div>
    </div>
  );
}

export default function ManageOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data, isLoading } = useListOrders({ status: statusFilter || undefined, limit: 100 });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Commandes</h1>
        <p className="text-muted-foreground mt-2">Gérez et suivez toutes les commandes.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[{ value: "", label: "Toutes" }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === tab.value ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}>
            {tab.label}
            {tab.value === "" && data && <span className="ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">{data.total}</span>}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {["Commande", "Client", "Wilaya", "Montant", "Statut", "Date", "Actions"].map(h => (
                  <th key={h} className="p-4 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Chargement des commandes...</td></tr>
              ) : !data?.orders.length ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Aucune commande trouvée.</td></tr>
              ) : data.orders.map(order => (
                <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-mono font-semibold text-primary">#{order.orderNumber}</td>
                  <td className="p-4">
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="text-muted-foreground text-xs">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">{order.wilayaName}</td>
                  <td className="p-4 font-bold">{formatDZD(order.total)}</td>
                  <td className="p-4"><StatusBadge status={order.status} /></td>
                  <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString("fr-DZ")}</td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="gap-1.5">
                      <Eye className="w-4 h-4" /> Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </AdminLayout>
  );
}
