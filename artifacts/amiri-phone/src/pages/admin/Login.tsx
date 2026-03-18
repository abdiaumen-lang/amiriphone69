import { useState } from "react";
import { useLocation } from "wouter";
import { Input, Button, Card } from "@/components/UI";
import { useAuth } from "@/store/Store";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { mutate, isPending } = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token);
        setLocation("/admin");
      },
      onError: () => {
        toast({
          title: "Erreur de connexion",
          description: "Identifiants incorrects",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ data: { username, password } });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/30">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold">Administration</h1>
          <p className="text-muted-foreground mt-2">Connectez-vous pour gérer le magasin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Nom d'utilisateur" 
            required 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Input 
            label="Mot de passe" 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full h-12" isLoading={isPending}>
            Se connecter
          </Button>
        </form>
      </Card>
    </div>
  );
}
