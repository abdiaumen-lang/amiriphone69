import { Link, useSearch } from "wouter";
import { AppLayout } from "@/components/Layout";
import { PageTransition, Button } from "@/components/UI";
import { CheckCircle2, ChevronRight, Package } from "lucide-react";

export default function OrderSuccess() {
  const search = useSearch();
  const orderNumber = new URLSearchParams(search).get("orderNumber") || "AM-123456";

  return (
    <AppLayout>
      <PageTransition className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full bg-card border border-border rounded-[2rem] p-8 md:p-12 text-center shadow-2xl shadow-primary/5">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
             <div className="absolute inset-0 bg-success/20 rounded-full animate-ping"></div>
             <CheckCircle2 className="w-12 h-12 text-success relative z-10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Commande Confirmée !</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Merci pour votre confiance. Votre commande a été enregistrée avec succès. Notre équipe vous contactera sous peu pour la confirmation d'expédition.
          </p>

          <div className="bg-secondary rounded-2xl p-6 mb-8 flex items-center justify-center gap-4 text-left">
             <Package className="w-8 h-8 text-primary" />
             <div>
                <div className="text-sm text-muted-foreground">Numéro de commande</div>
                <div className="font-mono font-bold text-xl tracking-wider text-foreground">{orderNumber}</div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/products">
              <Button size="lg" className="w-full rounded-full h-14">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
