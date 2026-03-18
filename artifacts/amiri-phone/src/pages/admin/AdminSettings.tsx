import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, Button } from "@/components/UI";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Palette, Store, Plug, ToggleLeft, FileText, Languages, Save, Eye,
  Image as ImageIcon, Type, Layout, AlertCircle, CheckCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "appearance", label: "Apparence",     icon: Palette },
  { id: "store",      label: "Boutique",      icon: Store },
  { id: "content",    label: "Contenu",        icon: FileText },
  { id: "features",   label: "Fonctionnalités",icon: ToggleLeft },
  { id: "integrations",label: "Intégrations",  icon: Plug },
  { id: "languages",  label: "Langues",        icon: Languages },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold">{title}</h3>
        {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
      <span className="font-medium text-sm">{label}</span>
      <button onClick={() => onChange(!checked)}
        className={cn("relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none", checked ? "bg-primary" : "bg-border")}>
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", checked ? "translate-x-6" : "translate-x-0")} />
      </button>
    </div>
  );
}

function ColorPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border">
      <input type="color" value={value} onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent p-0.5" />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground font-mono">{value}</div>
      </div>
    </div>
  );
}

// ─── Tabs Content ─────────────────────────────────────────────────────────────
function AppearanceTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <Section title="Logo & Identité">
        <Field label="URL du Logo" hint="Lien direct vers l'image (PNG, SVG). Laissez vide pour utiliser les initiales.">
          <TextInput value={settings.storeLogo || ""} onChange={v => onChange("storeLogo", v)} placeholder="https://..." />
        </Field>
        <Field label="Aperçu">
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border">
            {settings.storeLogo ? (
              <img src={settings.storeLogo} className="w-12 h-12 object-contain rounded-xl" />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white" style={{ background: settings.primaryColor || "#007AFF" }}>
                {(settings.storeName || "A")[0]}
              </div>
            )}
            <div>
              <div className="font-bold text-lg">{settings.storeName || "Amiri Phone"}</div>
              <div className="text-sm text-muted-foreground">Aperçu dans la barre de navigation</div>
            </div>
          </div>
        </Field>
      </Section>

      <Section title="Couleurs" desc="Les couleurs s'appliquent automatiquement sur tout le site.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ColorPicker label="Couleur Principale" value={settings.primaryColor || "#007AFF"} onChange={v => onChange("primaryColor", v)} />
          <ColorPicker label="Couleur Secondaire" value={settings.accentColor || "#0051D4"} onChange={v => onChange("accentColor", v)} />
          <ColorPicker label="Couleur Success" value={settings.successColor || "#34C759"} onChange={v => onChange("successColor", v)} />
          <ColorPicker label="Couleur Danger" value={settings.dangerColor || "#FF3B30"} onChange={v => onChange("dangerColor", v)} />
        </div>
        <div className="p-4 rounded-xl border border-border bg-secondary/30">
          <div className="text-xs font-semibold text-muted-foreground mb-3">Prévisualisation des boutons</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg" style={{ background: settings.primaryColor || "#007AFF" }}>Principale</span>
            <span className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: settings.accentColor || "#0051D4" }}>Accent</span>
            <span className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: settings.successColor || "#34C759" }}>Succès</span>
            <span className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: settings.dangerColor || "#FF3B30" }}>Danger</span>
          </div>
        </div>
      </Section>

      <Section title="Typographie">
        <Field label="Police principale">
          <select value={settings.fontFamily || "Inter"} onChange={e => onChange("fontFamily", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {["Inter", "Poppins", "Roboto", "Montserrat", "Cairo", "Tajawal", "Noto Sans Arabic"].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Taille de base (px)">
          <input type="range" min={14} max={18} value={parseInt(settings.fontSize || "16")}
            onChange={e => onChange("fontSize", e.target.value + "px")}
            className="w-full accent-primary" />
          <div className="text-sm text-muted-foreground mt-1">Taille: {settings.fontSize || "16px"}</div>
        </Field>
        <Field label="Rayon des bords (Rounded)">
          <input type="range" min={0} max={24} value={parseInt(settings.borderRadius || "12")}
            onChange={e => onChange("borderRadius", e.target.value + "px")}
            className="w-full accent-primary" />
          <div className="flex gap-2 mt-2">
            {["0", "4", "8", "12", "16", "24"].map(r => (
              <div key={r} className="w-10 h-10 bg-primary flex items-center justify-center text-white text-xs font-bold"
                style={{ borderRadius: r + "px" }}>{r}</div>
            ))}
          </div>
        </Field>
      </Section>
    </div>
  );
}

function StoreTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <Section title="Informations générales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom de la boutique (FR)"><TextInput value={settings.storeName || ""} onChange={v => onChange("storeName", v)} placeholder="Amiri Phone" /></Field>
          <Field label="اسم المتجر (AR)"><TextInput value={settings.storeNameAr || ""} onChange={v => onChange("storeNameAr", v)} placeholder="أميري فون" /></Field>
          <Field label="Téléphone principal"><TextInput value={settings.storePhone || ""} onChange={v => onChange("storePhone", v)} placeholder="0557 32 54 17" /></Field>
          <Field label="Téléphone secondaire"><TextInput value={settings.storePhone2 || ""} onChange={v => onChange("storePhone2", v)} placeholder="0XXX XX XX XX" /></Field>
        </div>
        <Field label="Adresse (FR)"><TextInput value={settings.storeAddress || ""} onChange={v => onChange("storeAddress", v)} placeholder="Rue, Commune, Wilaya" /></Field>
        <Field label="العنوان (AR)"><TextInput value={settings.storeAddressAr || ""} onChange={v => onChange("storeAddressAr", v)} placeholder="الشارع، البلدية، الولاية" /></Field>
      </Section>

      <Section title="SEO & Référencement" desc="Ces informations apparaissent dans les résultats de recherche Google.">
        <Field label="Titre SEO" hint="Ex: Amiri Phone - Meilleurs Smartphones en Algérie">
          <TextInput value={settings.seoTitle || ""} onChange={v => onChange("seoTitle", v)} />
        </Field>
        <Field label="Description SEO" hint="Entre 120 et 160 caractères recommandés.">
          <TextArea value={settings.seoDescription || ""} onChange={v => onChange("seoDescription", v)} rows={3} />
          <div className="text-xs text-muted-foreground">{(settings.seoDescription || "").length} / 160 caractères</div>
        </Field>
      </Section>

      <Section title="Livraison">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Frais de livraison par défaut (DA)">
            <TextInput type="number" value={settings.defaultShippingCost || "500"} onChange={v => onChange("defaultShippingCost", Number(v))} />
          </Field>
          <Field label="Seuil livraison gratuite (DA)" hint="Laissez 0 pour désactiver.">
            <TextInput type="number" value={settings.freeShippingThreshold || ""} onChange={v => onChange("freeShippingThreshold", v ? Number(v) : null)} placeholder="0 = désactivé" />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function ContentTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  const content = settings.pageContent || {};
  const update = (section: string, field: string, val: string) => {
    onChange("pageContent", { ...content, [section]: { ...(content[section] || {}), [field]: val } });
  };

  return (
    <div className="space-y-8">
      <Section title="Page d'accueil — Hero" desc="La grande section en haut de la page principale.">
        <Field label="Badge (petit texte)"><TextInput value={content.hero?.badge || "Nouveaux Arrivages Apple & Samsung"} onChange={v => update("hero","badge",v)} /></Field>
        <Field label="Titre principal (ligne 1)"><TextInput value={content.hero?.title1 || "L'excellence"} onChange={v => update("hero","title1",v)} /></Field>
        <Field label="Titre principal (ligne 2 — colorée)"><TextInput value={content.hero?.title2 || "Technologique"} onChange={v => update("hero","title2",v)} /></Field>
        <Field label="Titre principal (ligne 3)"><TextInput value={content.hero?.title3 || "En Algérie."} onChange={v => update("hero","title3",v)} /></Field>
        <Field label="Sous-titre"><TextArea rows={2} value={content.hero?.subtitle || "Découvrez la meilleure sélection de smartphones premium chez Amiri Phone."} onChange={v => update("hero","subtitle",v)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Texte bouton principal"><TextInput value={content.hero?.cta1 || "Voir le catalogue"} onChange={v => update("hero","cta1",v)} /></Field>
          <Field label="Texte bouton secondaire"><TextInput value={content.hero?.cta2 || "Contactez-nous"} onChange={v => update("hero","cta2",v)} /></Field>
        </div>
      </Section>

      <Section title="Page d'accueil — Badges de confiance">
        {[
          { key: "trust1", def: "Livraison Partout", sub: "48 Wilayas" },
          { key: "trust2", def: "Paiement à la Livraison", sub: "Paiement sécurisé" },
          { key: "trust3", def: "Garantie Qualité", sub: "12 mois" },
        ].map(({ key, def, sub }) => (
          <div key={key} className="grid grid-cols-2 gap-3">
            <Field label={`${key} — Titre`}><TextInput value={content[key]?.title || def} onChange={v => update(key,"title",v)} /></Field>
            <Field label={`${key} — Sous-titre`}><TextInput value={content[key]?.subtitle || sub} onChange={v => update(key,"subtitle",v)} /></Field>
          </div>
        ))}
      </Section>

      <Section title="Avis clients — Page d'accueil">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre d'avis"><TextInput value={content.reviews?.count || "8"} onChange={v => update("reviews","count",v)} /></Field>
          <Field label="Note affichée"><TextInput value={content.reviews?.rating || "5.0"} onChange={v => update("reviews","rating",v)} /></Field>
        </div>
        <Field label="Titre de la section"><TextInput value={content.reviews?.title || "Ce que disent nos clients"} onChange={v => update("reviews","title",v)} /></Field>
      </Section>

      <Section title="Popup de bienvenue" desc="Popup affiché à la première visite pour collecter l'attention.">
        <Field label="Titre du popup"><TextInput value={content.popup?.title || "🎉 Offre spéciale!"} onChange={v => update("popup","title",v)} /></Field>
        <Field label="Message"><TextArea rows={2} value={content.popup?.message || "Commandez maintenant et profitez de la livraison rapide."} onChange={v => update("popup","message",v)} /></Field>
        <Field label="Texte du bouton CTA"><TextInput value={content.popup?.cta || "Voir les offres"} onChange={v => update("popup","cta",v)} /></Field>
      </Section>

      <Section title="Pied de page (Footer)">
        <Field label="Slogan"><TextInput value={content.footer?.slogan || "Votre partenaire tech en Algérie"} onChange={v => update("footer","slogan",v)} /></Field>
        <Field label="Copyright"><TextInput value={content.footer?.copyright || `© ${new Date().getFullYear()} Amiri Phone. Tous droits réservés.`} onChange={v => update("footer","copyright",v)} /></Field>
      </Section>
    </div>
  );
}

function FeaturesTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  const features = settings.features || {};
  const toggle = (key: string, val: boolean) => onChange("features", { ...features, [key]: val });

  const items = [
    { key: "countdownTimer", label: "⏱ Countdown Timer", desc: "Affiche un compte à rebours sur les pages produits" },
    { key: "stockScarcity", label: "📦 Indicateur de stock faible", desc: '"Plus que X en stock!" quand le stock < 5' },
    { key: "whatsappWidget", label: "💬 Bouton WhatsApp flottant", desc: "Bouton WhatsApp fixe en bas à droite de toutes les pages" },
    { key: "reviewsSection", label: "⭐ Section Avis clients", desc: "Section témoignages sur la page d'accueil" },
    { key: "welcomePopup", label: "🎁 Popup de bienvenue", desc: "Popup affiché à la première visite" },
    { key: "searchBar", label: "🔍 Barre de recherche", desc: "Recherche rapide dans la barre de navigation" },
    { key: "priceFilter", label: "🔧 Filtres de prix", desc: "Filtre par fourchette de prix dans la page catalogue" },
    { key: "productReviews", label: "💬 Avis sur les produits", desc: "Formulaire d'avis sur les pages produits" },
    { key: "relatedProducts", label: "🔗 Produits similaires", desc: "Section de produits recommandés sur les pages produits" },
    { key: "stickyCart", label: "🛒 Panier sticky", desc: "Barre de panier fixe en bas de page sur mobile" },
    { key: "facebookPixel", label: "📊 Facebook Pixel", desc: "Tracking des conversions Facebook Ads" },
    { key: "tiktokPixel", label: "📊 TikTok Pixel", desc: "Tracking des conversions TikTok Ads" },
    { key: "telegramNotifs", label: "📱 Notifications Telegram", desc: "Alerte Telegram pour chaque nouvelle commande" },
    { key: "whatsappNotifs", label: "📱 Notifications WhatsApp", desc: "Message WhatsApp pour chaque nouvelle commande" },
  ];

  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Activez ou désactivez les fonctionnalités sans toucher au code. Les changements s'appliquent instantanément.</span>
      </div>
      {items.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border hover:border-primary/30 transition-colors">
          <div>
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
          </div>
          <button onClick={() => toggle(key, !(features[key] ?? true))}
            className={cn("relative w-12 h-6 rounded-full transition-all duration-200 shrink-0", (features[key] ?? true) ? "bg-primary" : "bg-border")}>
            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", (features[key] ?? true) ? "translate-x-6" : "translate-x-0")} />
          </button>
        </div>
      ))}
    </div>
  );
}

function IntegrationsTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <Section title="Telegram Bot" desc="Recevoir des notifications pour chaque nouvelle commande.">
        <Field label="Token du Bot" hint="Obtenez-le via @BotFather sur Telegram.">
          <TextInput type="password" value={settings.telegramBotToken || ""} onChange={v => onChange("telegramBotToken", v)} placeholder="1234567890:ABC..." />
        </Field>
        <Field label="Chat ID" hint="L'ID de votre groupe ou canal Telegram.">
          <TextInput value={settings.telegramChatId || ""} onChange={v => onChange("telegramChatId", v)} placeholder="-100xxxxxxxxx" />
        </Field>
      </Section>

      <Section title="WhatsApp" desc="Notifications et bouton de contact WhatsApp.">
        <Field label="Numéro WhatsApp" hint="Format international sans +. Ex: 213557325417">
          <TextInput value={settings.whatsappNumber || ""} onChange={v => onChange("whatsappNumber", v)} placeholder="213557325417" />
        </Field>
        <Field label="WhatsApp API Token (Meta Cloud API)">
          <TextInput type="password" value={settings.whatsappToken || ""} onChange={v => onChange("whatsappToken", v)} placeholder="Token d'accès..." />
        </Field>
        <Field label="Phone Number ID">
          <TextInput value={settings.whatsappPhoneId || ""} onChange={v => onChange("whatsappPhoneId", v)} placeholder="ID du numéro..." />
        </Field>
      </Section>

      <Section title="Pixels & Analytics">
        <Field label="Facebook Pixel ID" hint="Trouvez-le dans Gestionnaire d'événements Facebook Ads.">
          <TextInput value={settings.facebookPixelId || ""} onChange={v => onChange("facebookPixelId", v)} placeholder="123456789012345" />
        </Field>
        <Field label="TikTok Pixel ID">
          <TextInput value={settings.tiktokPixelId || ""} onChange={v => onChange("tiktokPixelId", v)} placeholder="CXXXXXXXXXXXXXXXXXX" />
        </Field>
        <Field label="Google Analytics 4 (Measurement ID)">
          <TextInput value={settings.gaId || ""} onChange={v => onChange("gaId", v)} placeholder="G-XXXXXXXXXX" />
        </Field>
      </Section>

      <Section title="Google Sheets" desc="Sauvegarder les commandes dans une feuille Google.">
        <Field label="ID de la feuille Google" hint="L'ID dans l'URL: docs.google.com/spreadsheets/d/{ID}/edit">
          <TextInput value={settings.googleSheetsId || ""} onChange={v => onChange("googleSheetsId", v)} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
        </Field>
      </Section>

      <Section title="Transporteurs" desc="Configurer les API des sociétés de livraison.">
        <Field label="Yalidine API Key">
          <TextInput type="password" value={settings.yalidineKey || ""} onChange={v => onChange("yalidineKey", v)} placeholder="Clé API Yalidine..." />
        </Field>
        <Field label="ZR Express API Key">
          <TextInput type="password" value={settings.zrExpressKey || ""} onChange={v => onChange("zrExpressKey", v)} placeholder="Clé API ZR Express..." />
        </Field>
        <Field label="Maystro Delivery API Key">
          <TextInput type="password" value={settings.maystroKey || ""} onChange={v => onChange("maystroKey", v)} placeholder="Clé API Maystro..." />
        </Field>
      </Section>
    </div>
  );
}

function LanguagesTab({ settings, onChange }: { settings: any; onChange: (k: string, v: any) => void }) {
  const labels = settings.uiLabels || {};
  const update = (key: string, val: string) => onChange("uiLabels", { ...labels, [key]: val });

  const defaultLabels: Record<string, string> = {
    addToCart: "Ajouter au panier",
    orderNow: "Commander maintenant",
    checkout: "Passer la commande",
    totalAmount: "Montant total",
    shipping: "Livraison",
    free: "Gratuit",
    inStock: "En stock",
    outOfStock: "Rupture de stock",
    search: "Rechercher...",
    allCategories: "Toutes les catégories",
    reviews: "Avis",
    relatedProducts: "Produits similaires",
    selectWilaya: "Choisir la wilaya",
    selectCommune: "Choisir la commune",
    payOnDelivery: "Paiement à la livraison",
    orderSuccess: "Commande confirmée!",
    customerName: "Nom complet",
    phone: "Numéro de téléphone",
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Modifiez les textes de l'interface. Vous pouvez les mettre en français, arabe ou les deux.</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(defaultLabels).map(([key, def]) => (
          <div key={key} className="grid grid-cols-2 gap-3 items-center">
            <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg font-mono">{key}</div>
            <TextInput value={labels[key] || def} onChange={v => update(key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminSettings() {
  const { data: serverSettings, isLoading } = useGetSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("appearance");
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (serverSettings && !isDirty) {
      setLocalSettings(serverSettings as any);
    }
  }, [serverSettings]);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
    // Apply colors live
    if (key === "primaryColor") {
      document.documentElement.style.setProperty("--primary-preview", value);
    }
  };

  const { mutate: saveSettings, isPending } = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
        setIsDirty(false);
        toast({ title: "✅ Paramètres sauvegardés!", description: "Les changements sont appliqués sur le site." });
        applyTheme(localSettings);
      },
      onError: () => toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" }),
    },
  });

  const applyTheme = (s: Record<string, any>) => {
    const root = document.documentElement;
    if (s.primaryColor) root.style.setProperty("--primary-override", s.primaryColor);
    if (s.fontFamily) document.body.style.fontFamily = `'${s.fontFamily}', sans-serif`;
    if (s.borderRadius) root.style.setProperty("--radius-override", s.borderRadius);
  };

  const handleSave = () => {
    saveSettings({ data: localSettings as any });
  };

  const handleReset = () => {
    if (confirm("Réinitialiser les paramètres? Toutes les modifications non sauvegardées seront perdues.")) {
      setLocalSettings(serverSettings as any || {});
      setIsDirty(false);
    }
  };

  if (isLoading) return (
    <AdminLayout>
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-secondary rounded w-1/3" />
        <div className="h-96 bg-secondary rounded-2xl" />
      </div>
    </AdminLayout>
  );

  const tabContent: Record<string, React.ReactNode> = {
    appearance: <AppearanceTab settings={localSettings} onChange={handleChange} />,
    store: <StoreTab settings={localSettings} onChange={handleChange} />,
    content: <ContentTab settings={localSettings} onChange={handleChange} />,
    features: <FeaturesTab settings={localSettings} onChange={handleChange} />,
    integrations: <IntegrationsTab settings={localSettings} onChange={handleChange} />,
    languages: <LanguagesTab settings={localSettings} onChange={handleChange} />,
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Personnalisez entièrement votre boutique sans toucher au code.</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-1.5 text-orange-600 text-sm font-medium bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              Modifications non sauvegardées
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5"><RefreshCw className="w-4 h-4" />Réinitialiser</Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5"><Eye className="w-4 h-4" />Aperçu</Button>
          <Button onClick={handleSave} isLoading={isPending} size="sm" className="gap-1.5"><Save className="w-4 h-4" />Sauvegarder</Button>
        </div>
      </div>

      <div className={cn("grid gap-8", showPreview ? "grid-cols-2" : "grid-cols-1")}>
        {/* Settings Panel */}
        <div>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-6 p-1 bg-secondary/50 rounded-2xl border border-border">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center min-w-[80px]",
                    activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <Card className="p-6">
            {tabContent[activeTab]}
          </Card>
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="sticky top-8">
            <div className="rounded-2xl border border-border overflow-hidden shadow-xl bg-black">
              <div className="bg-secondary/80 px-4 py-2 flex items-center gap-2 border-b border-border">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-mono bg-background rounded-lg px-3 py-1">amiriphone.dz</div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <iframe src="/" className="w-full border-0" style={{ height: "calc(100vh - 200px)" }} />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">Aperçu en direct — Sauvegardez pour voir les changements</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
