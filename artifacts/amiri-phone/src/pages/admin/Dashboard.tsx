import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/UI";
import { formatDZD } from "@/lib/utils";
import { useGetAdminStats } from "@workspace/api-client-react";
import { ShoppingBag, TrendingUp, Package, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading || !stats) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-secondary rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-secondary rounded-2xl"></div>)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: "Revenu Total", value: formatDZD(stats.totalRevenue), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Commandes", value: stats.totalOrders, icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "En Attente", value: stats.pendingOrders, icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
    { title: "Stock Faible", value: stats.lowStockProducts, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Vue d'ensemble</h1>
        <p className="text-muted-foreground mt-2">Statistiques et performances de la boutique.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</div>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Dernières Commandes</h2>
          <div className="space-y-4">
            {stats.recentOrders?.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                <div>
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-sm text-muted-foreground">{order.orderNumber} - {order.wilayaName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{formatDZD(order.total)}</div>
                  <div className="text-xs uppercase font-semibold mt-1 px-2 py-0.5 bg-background rounded text-muted-foreground inline-block">
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">Aucune commande récente.</div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Ventes par Wilaya</h2>
          <div className="space-y-4">
            {stats.ordersByWilaya?.map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="font-medium">{w.wilaya}</div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{w.count} cmdes</span>
                  <span className="font-bold">{formatDZD(w.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
