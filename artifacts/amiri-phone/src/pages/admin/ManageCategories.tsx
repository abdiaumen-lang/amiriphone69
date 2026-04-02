import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Button } from "@/components/UI";
import { getSafeImageUrl } from "@/lib/utils";
import {
  useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
} from "@workspace/api-client-react";
import type { Category } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, FolderTree } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

const EMPTY_FORM = {
  name: "",
  nameAr: "",
  nameFr: "",
  slug: "",
  icon: "",
};

type FormType = typeof EMPTY_FORM;

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
  );
}

function CategoryForm({ initial, onClose }: { initial: Category | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState<FormType>(() => {
    if (!initial) return EMPTY_FORM;
    return {
      name: initial.name || "",
      nameAr: initial.nameAr || "",
      nameFr: initial.nameFr || "",
      slug: initial.slug || "",
      icon: initial.icon || "",
    };
  });

  const { mutate: createCategory, isPending: creating } = useCreateCategory({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Catégorie ajoutée!" }); onClose(); },
      onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
    },
  });

  const { mutate: updateCategory, isPending: updating } = useUpdateCategory({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Catégorie mise à jour!" }); onClose(); },
      onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
    },
  });

  const handleSave = () => {
    const payload = { ...form };
    if (!payload.slug) {
      payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    if (initial) {
      updateCategory({ id: initial.id, data: payload as any });
    } else {
      createCategory({ data: payload as any });
    }
  };

  const set = (k: keyof FormType, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const isPending = creating || updating;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">{initial ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Nom (FR) *</label>
            <TextInput value={form.name} onChange={v => set("name", v)} placeholder="Ex: Smartphones" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">اسم التصنيف (AR)</label>
            <TextInput value={form.nameAr} onChange={v => set("nameAr", v)} placeholder="هواتف ذكية" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Nom (EN/autre)</label>
            <TextInput value={form.nameFr} onChange={v => set("nameFr", v)} placeholder="Smartphones" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Slug (Identifiant d'URL)</label>
            <TextInput value={form.slug} onChange={v => set("slug", v)} placeholder="Laissez vide pour générer automatiquement" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Image/Icône</label>
            <p className="text-xs text-muted-foreground mb-2">Sera affichée dans le carrousel sur la page d'accueil</p>
            <ImageUploader
              images={form.icon ? [form.icon] : []}
              onChange={imgs => set("icon", imgs[0] || "")}
              maxImages={1}
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3 sticky bottom-0 bg-card border-t border-border mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} isLoading={isPending} className="flex-1">
            {initial ? "Mettre à jour" : "Ajouter la catégorie"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManageCategories() {
  const { data: categories, isLoading } = useListCategories();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [search, setSearch] = useState("");

  const { mutate: deleteCategory } = useDeleteCategory({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/categories"] }); toast({ title: "Catégorie supprimée" }); },
      onError: (e: any) => toast({ title: "Erreur", description: "Impossible de supprimer: " + e.message, variant: "destructive" }),
    },
  });

  const filtered = (categories || []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.nameAr || "").includes(search)
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Catégories</h1>
          <p className="text-muted-foreground mt-2">Gérez les catégories de votre boutique.</p>
        </div>
        <Button onClick={() => setEditing("new")} className="gap-2 w-full sm:w-auto"><Plus className="w-5 h-5" />Ajouter une catégorie</Button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une catégorie..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {["Catégorie", "Slug", "Produits", "Actions"].map(h => (
                  <th key={h} className="p-4 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Chargement...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">Aucune catégorie trouvée.</td></tr>
              ) : filtered.map(category => (
                <tr key={category.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-border bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {category.icon ? (
                          <img src={getSafeImageUrl(category.icon)} className="w-full h-full object-contain p-1" />
                        ) : <FolderTree className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">{category.name}</div>
                        {category.nameAr && <div className="text-xs text-muted-foreground">{category.nameAr}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{category.slug}</td>
                  <td className="p-4 font-semibold">{category.productCount || 0}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(category)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("Supprimer cette catégorie?")) deleteCategory({ id: category.id }); }}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing !== null && (
        <CategoryForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </AdminLayout>
  );
}
