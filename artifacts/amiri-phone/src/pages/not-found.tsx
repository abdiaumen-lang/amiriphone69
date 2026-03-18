import { Link } from "wouter";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/UI";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-8xl font-display font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page non trouvée</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full">Retour à l'accueil</Button>
        </Link>
      </div>
    </AppLayout>
  );
}
