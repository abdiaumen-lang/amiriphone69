import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Button, Badge } from "@/components/UI";
import { formatDZD, cn } from "@/lib/utils";
import {
  useListProducts, useListCategories, useCreateProduct, useUpdateProduct, useDeleteProduct,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Star, Package, Tag } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

const EMPTY_FORM = {
  name: "", nameAr: "", nameFr: "",
  description: "", descriptionAr: "", descriptionFr: "",
  price: 0, originalPrice: null as number | null,
  images: [""],
  categoryId: null as number | null,
  stock: 0,
  featured: false,
  onSale: false,
  discount: null as number | null,
  brand: "", model: "",
  specs: {} as Record<string, string>,
};
type FormType = typeof EMPTY_FORM;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
  );
}

function ProductForm({ initial, onClose }: { initial: Product | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: cats } = useListCategories();

  const [form, setForm] = useState<FormType>(() => {
    if (!initial) return EMPTY_FORM;
    return {
      name: initial.name || "",
      nameAr: initial.nameAr || "",
      nameFr: initial.nameFr || "",
      description: initial.description || "",
      descriptionAr: initial.descriptionAr || "",
      descriptionFr: initial.descriptionFr || "",
      price: initial.price,
      originalPrice: initial.originalPrice ?? null,
      images: initial.images.length ? initial.images : [""],
      categoryId: initial.categoryId ?? null,
      stock: initial.stock,
      featured: initial.featured,
      onSale: initial.onSale,
      discount: initial.discount ?? null,
      brand: initial.brand || "",
      model: initial.model || "",
      specs: (initial.specs as Record<string, string>) || {},
    };
  });

  const [specsText, setSpecsText] = useState(
    Object.entries(form.specs || {}).map(([k, v]) => `${k}: ${v}`).join("\n")
  );
  const [tab, setTab] = useState<"basic" | "media" | "advanced">("basic");

  const { mutate: createProduct, isPending: creating } = useCreateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Produit ajouté!" }); onClose(); },
      onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
    },
  });
  const { mutate: updateProduct, isPending: updating } = useUpdateProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Produit mis à jour!" }); onClose(); },
      onError: (e: any) => toast({ title: "Erreur", description: e?.message, variant: "destructive" }),
    },
  });

  const parseSpecs = () => {
    const result: Record<string, string> = {};
    specsText.split("\n").forEach(line => {
      const idx = line.indexOf(":");
      if (idx > 0) { result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim(); }
    });
    return result;
  };

  const handleSave = () => {
    const payload = { ...form, specs: parseSpecs(), images: form.images.filter(Boolean) };
    if (initial) {
      updateProduct({ id: initial.id, data: payload as any });
    } else {
      createProduct({ data: payload as any });
    }
  };

  const set = (k: keyof FormType, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const isPending = creating || updating;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold">{initial ? "Modifier le produit" : "Nouveau produit"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {[{ id: "basic", label: "Informations" }, { id: "media", label: "Images & Specs" }, { id: "advanced", label: "Avancé" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-all", tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-5">
          {tab === "basic" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nom (FR) *"><TextInput value={form.name} onChange={v => set("name", v)} placeholder="Ex: iPhone 15 Pro Max" /></Field>
                <Field label="اسم المنتج (AR)"><TextInput value={form.nameAr} onChange={v => set("nameAr", v)} placeholder="آيفون 15 برو" /></Field>
                <Field label="Nom (EN/FR)"><TextInput value={form.nameFr} onChange={v => set("nameFr", v)} placeholder="iPhone 15 Pro Max" /></Field>
              </div>

              <Field label="Description (FR)">
                <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </Field>
              <Field label="وصف المنتج (AR)">
                <textarea rows={2} value={form.descriptionAr} onChange={e => set("descriptionAr", e.target.value)} dir="rtl"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Prix (DA) *"><TextInput type="number" value={form.price} onChange={v => set("price", Number(v))} placeholder="150000" /></Field>
                <Field label="Prix original (DA)"><TextInput type="number" value={form.originalPrice ?? ""} onChange={v => set("originalPrice", v ? Number(v) : null)} placeholder="0 = aucun" /></Field>
                <Field label="Remise (%)"><TextInput type="number" value={form.discount ?? ""} onChange={v => set("discount", v ? Number(v) : null)} placeholder="0–100" /></Field>
                <Field label="Stock *"><TextInput type="number" value={form.stock} onChange={v => set("stock", Number(v))} /></Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Marque"><TextInput value={form.brand} onChange={v => set("brand", v)} placeholder="Apple, Samsung..." /></Field>
                <Field label="Modèle"><TextInput value={form.model} onChange={v => set("model", v)} placeholder="iPhone 15 Pro Max" /></Field>
              </div>

              <Field label="Catégorie">
                <select value={form.categoryId ?? ""} onChange={e => set("categoryId", e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Aucune catégorie —</option>
                  {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <div className="flex flex-wrap gap-3">
                {[{ key: "featured", label: "⭐ Mis en avant" }, { key: "onSale", label: "🏷️ En promotion" }].map(({ key, label }) => (
                  <button key={key} onClick={() => set(key as any, !form[key as keyof FormType])}
                    className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-all", (form[key as keyof FormType] as boolean) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary")}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === "media" && (
            <>
              <Field label="Images du produit" hint="Cliquez sur + ou glissez des images. La première image sera l'image principale.">
                <ImageUploader
                  images={form.images.filter(Boolean)}
                  onChange={imgs => set("images", imgs.length ? imgs : [""])}
                  maxImages={8}
                />
              </Field>

              <Field label="Spécifications techniques" hint="Format: Clé: Valeur (une par ligne). Ex: Écran: 6.7 pouces">
                <textarea rows={10} value={specsText} onChange={e => setSpecsText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder={"Écran: 6.7 pouces OLED\nProcesseur: A17 Pro\nRAM: 8 Go\nStockage: 256 Go\nBatterie: 4422 mAh\nOS: iOS 17"} />
              </Field>
            </>
          )}

          {tab === "advanced" && (
            <>
              <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                <div className="text-sm font-semibold mb-3">Aperçu de la fiche produit</div>
                <div className="flex gap-4 items-start">
                  {form.images.filter(Boolean)[0] && (
                    <img src={form.images.filter(Boolean)[0]} className="w-20 h-20 object-contain rounded-xl bg-background border border-border" />
                  )}
                  <div>
                    <div className="font-bold">{form.name || "Nom du produit"}</div>
                    <div className="text-muted-foreground text-sm">{form.brand} {form.model}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-primary">{formatDZD(form.price)}</span>
                      {form.originalPrice && <span className="text-sm line-through text-muted-foreground">{formatDZD(form.originalPrice)}</span>}
                      {form.discount && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">-{form.discount}%</span>}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {form.featured && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">★ Populaire</span>}
                      {form.onSale && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Promo</span>}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", form.stock > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                        {form.stock > 0 ? `Stock: ${form.stock}` : "Rupture"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-xl border border-border">
                <strong>Note:</strong> Les champs avancés comme l'URL canonique, les balises méta produit, et les tags sont configurables dans les paramètres SEO globaux. Les stocks sont gérés automatiquement lors des commandes.
              </div>
            </>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3 sticky bottom-0 bg-card border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} isLoading={isPending} className="flex-1">
            {initial ? "Mettre à jour" : "Ajouter le produit"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ManageProducts() {
  const { data: productsData, isLoading } = useListProducts({ limit: 200 });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [search, setSearch] = useState("");

  const { mutate: deleteProduct } = useDeleteProduct({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Produit supprimé" }); },
    },
  });

  const filtered = (productsData?.products || []).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Produits</h1>
          <p className="text-muted-foreground mt-2">{productsData?.total || 0} produits dans le catalogue.</p>
        </div>
        <Button onClick={() => setEditing("new")} className="gap-2"><Plus className="w-5 h-5" />Ajouter un produit</Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {["Produit", "Prix", "Stock", "Catégorie", "Statut", "Actions"].map(h => (
                  <th key={h} className="p-4 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Chargement...</td></tr>
              ) : !filtered.length ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Aucun produit trouvé.</td></tr>
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl border border-border bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} className="w-full h-full object-contain p-1" />
                        ) : <Package className="w-6 h-6 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold truncate max-w-[200px]">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.brand} • {product.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{formatDZD(product.price)}</div>
                    {product.originalPrice && <div className="text-xs text-muted-foreground line-through">{formatDZD(product.originalPrice)}</div>}
                  </td>
                  <td className="p-4">
                    <span className={cn("font-semibold", product.stock < 5 ? "text-destructive" : product.stock < 20 ? "text-orange-500" : "text-green-600")}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">{product.category?.name || "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {product.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">⭐ Vedette</span>}
                      {product.onSale && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">🏷️ Promo</span>}
                      {product.stock === 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Rupture</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditing(product as Product)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm("Supprimer ce produit?")) deleteProduct({ id: product.id }); }}
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
        <ProductForm initial={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </AdminLayout>
  );
}
