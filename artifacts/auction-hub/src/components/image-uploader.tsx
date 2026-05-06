import { useState, useCallback, useRef } from "react";
import { Upload, X, Image, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, or WebP images only.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    setUploadState("uploading");
    setProgress(0);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const token = localStorage.getItem("auction_hub_token");

      // Step 1: Request presigned URL from our server
      const metaRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!metaRes.ok) {
        const body = await metaRes.json().catch(() => ({}));
        throw new Error(body.error || "Failed to get upload URL");
      }

      const { uploadURL, objectPath } = await metaRes.json();

      // Step 2: Upload directly to GCS using presigned URL
      // Use XMLHttpRequest for upload progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadURL);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.send(file);
      });

      // Step 3: Construct the serving URL and store it
      const serveUrl = `/api/storage${objectPath}`;
      setProgress(100);
      setUploadState("success");
      onChange(serveUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      const message = err?.message || "Upload failed. Please try again.";
      setError(message);
      setUploadState("error");
      setPreview(null);
      toast.error(message);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }, [uploadFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUploadState("idle");
    setProgress(0);
    setError(null);
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />

      {preview && uploadState !== "error" ? (
        <div className="relative group rounded-xl overflow-hidden border border-border/50 bg-background/50">
          <img
            src={preview}
            alt="Preview"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors"
              >
                <Upload className="w-4 h-4" /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-2 bg-red-500/20 backdrop-blur border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors"
              >
                <X className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
          {uploadState === "success" && (
            <div className="absolute top-2 right-2 bg-green-500/90 text-white rounded-full p-1">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
          {uploadState === "uploading" && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <div className="w-48">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white text-xs text-center mt-1 font-mono">{progress}%</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => uploadState !== "uploading" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
            dragOver
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              : uploadState === "error"
              ? "border-red-500/50 bg-red-500/5 hover:border-red-400/70"
              : "border-border/50 bg-background/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]",
          )}
        >
          {uploadState === "uploading" ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-white">Uploading...</p>
                <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
              </div>
              <div className="w-48">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_6px_rgba(220,38,38,0.7)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          ) : uploadState === "error" ? (
            <>
              <AlertCircle className="w-10 h-10 text-red-400" />
              <div className="text-center px-4">
                <p className="text-sm font-bold text-red-400">Upload Failed</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-primary mt-2 font-bold">Click to try again</p>
              </div>
            </>
          ) : (
            <>
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                dragOver ? "bg-primary/20 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-muted"
              )}>
                {dragOver ? (
                  <Upload className="w-7 h-7 text-primary animate-bounce" />
                ) : (
                  <Image className="w-7 h-7 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  {dragOver ? "Drop your image here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max {MAX_SIZE_MB}MB</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
