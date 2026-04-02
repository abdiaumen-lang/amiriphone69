import { useRef, useState } from "react";
import { cn, getSafeImageUrl } from "@/lib/utils";
import { Upload, X, Plus, Video, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file); // Backend currently uses "image" field for all uploads

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

interface VideoUploaderProps {
  videoUrl: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function VideoUploader({ videoUrl, onChange, label }: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Veuillez sélectionner un fichier vidéo valide (MP4, WebM).");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadVideo(file);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Échec du téléchargement.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-semibold">{label}</label>}
      
      {!videoUrl ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer border-border hover:border-primary/50 hover:bg-primary/5",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileInput}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground font-medium">Téléchargement du vidéo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-bold">Ajouter un vidéo</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WebM jusqu'à 50 Mo</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative group rounded-2xl overflow-hidden border border-border aspect-video bg-black/5 flex items-center justify-center">
          <video 
            src={getSafeImageUrl(videoUrl)} 
            className="w-full h-full object-cover"
            controls
          />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <Video className="w-12 h-12 text-white/50" />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      
      <button 
        onClick={() => {
          const url = prompt("Entrez l'URL du vidéo:");
          if (url?.trim()) onChange(url.trim());
        }}
        className="text-xs text-primary hover:underline font-medium"
      >
        Ou ajouter une URL directe
      </button>
    </div>
  );
}
