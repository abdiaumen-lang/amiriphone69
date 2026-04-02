import { useRef, useState } from "react";
import { cn, getSafeImageUrl } from "@/lib/utils";
import { Upload, X, Plus, Image as ImageIcon, Loader2, GripVertical } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!fileArr.length) return;

    const remaining = maxImages - images.length;
    const toUpload = fileArr.slice(0, remaining);

    setUploading(true);
    setErrors([]);

    const results = await Promise.allSettled(toUpload.map(uploadImage));

    const newUrls: string[] = [];
    const newErrors: string[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        newUrls.push(result.value);
      } else {
        newErrors.push(`${toUpload[i].name}: ${result.reason?.message || "Erreur"}`);
      }
    });

    if (newUrls.length) onChange([...images, ...newUrls]);
    if (newErrors.length) setErrors(newErrors);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleUrlAdd = () => {
    const url = prompt("Entrez l'URL de l'image:");
    if (url?.trim() && (url.startsWith("http") || url.startsWith("/"))) {
      onChange([...images, url.trim()]);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    const newImages = [...images];
    const [item] = newImages.splice(from, 1);
    newImages.splice(to, 0, item);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          images.length >= maxImages ? "opacity-50 pointer-events-none" : ""
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Téléchargement en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Cliquez ou glissez des images ici</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP jusqu'à 10 Mo — max {maxImages} images</p>
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          {errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
        </div>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-secondary">
              <img
                src={getSafeImageUrl(url)}
                alt=""
                className="w-full h-full object-contain p-1"
                onError={e => { (e.target as HTMLImageElement).src = ""; }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                {i > 0 && (
                  <button onClick={() => moveImage(i, i - 1)}
                    className="p-1.5 bg-white/90 rounded-lg text-foreground hover:bg-white text-xs font-bold">←</button>
                )}
                {i < images.length - 1 && (
                  <button onClick={() => moveImage(i, i + 1)}
                    className="p-1.5 bg-white/90 rounded-lg text-foreground hover:bg-white text-xs font-bold">→</button>
                )}
                <button onClick={() => removeImage(i)}
                  className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
              {/* Badge: first = main */}
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  Principale
                </div>
              )}
            </div>
          ))}

          {/* Add more */}
          {images.length < maxImages && (
            <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => fileInputRef.current?.click()}>
              {uploading ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <>
                  <Plus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ajouter</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* URL option */}
      <button onClick={handleUrlAdd} className="text-xs text-primary hover:underline font-medium">
        + Ajouter une URL d'image externe
      </button>
    </div>
  );
}
