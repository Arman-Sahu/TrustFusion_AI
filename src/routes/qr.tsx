import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, ImageUp, Loader2, QrCode, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Page, PageHeader } from "@/components/PageHeader";
import { ResultView } from "@/components/ResultView";
import { useAnalysis } from "@/hooks/use-analysis";
import { api } from "@/services/api";
import { SAMPLES } from "@/services/demo";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "QR code scanner — CyberGuard" },
      { name: "description", content: "Scan or upload a QR code to see where it really leads and whether it's a scam — without opening it." },
      { property: "og:title", content: "QR code scanner — CyberGuard" },
      { property: "og:description", content: "Check QR codes for phishing and payment scams." },
    ],
  }),
  component: QrPage,
});

const MAX_FILE = 8 * 1024 * 1024;

function decode(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  return jsQR(img.data, w, h, { inversionAttempts: "attemptBoth" })?.data ?? null;
}

function QrPage() {
  const [content, setContent] = useState<string | null>(null);
  const [camOn, setCamOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { result, loading, run, reset } = useAnalysis();

  const handleDecoded = (data: string) => {
    setContent(data);
    run(() => api.qr(data));
  };

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  };
  useEffect(() => stopCam, []);

  async function startCam() {
    reset();
    setContent(null);
    if (!navigator.mediaDevices?.getUserMedia) { toast.error("Camera isn't available in this browser. Upload an image instead."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCamOn(true);
      requestAnimationFrame(() => {
        const v = videoRef.current!;
        v.srcObject = stream;
        v.play();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        const tick = () => {
          if (!streamRef.current) return;
          if (v.readyState === v.HAVE_ENOUGH_DATA) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const data = decode(ctx, canvas.width, canvas.height);
            if (data) { stopCam(); handleDecoded(data); return; }
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    } catch {
      toast.error("Camera permission was denied. You can upload a QR image instead.");
    }
  }

  function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file (PNG, JPG, WEBP)."); return; }
    if (file.size > MAX_FILE) { toast.error("That image is too large (max 8 MB)."); return; }
    reset();
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const data = decode(ctx, canvas.width, canvas.height);
      if (!data) { setContent(null); toast.error("We couldn't find a QR code in that image. Try a clearer, closer photo."); return; }
      handleDecoded(data);
    };
    img.onerror = () => toast.error("We couldn't open that image.");
    img.src = url;
  }

  return (
    <Page>
      <PageHeader icon={<QrCode />} title="Scan a QR code" subtitle="We decode the QR in your browser, then check where it leads. The destination is never opened." />
      <div className="glass rounded-2xl p-6">
        {camOn ? (
          <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-xl border border-primary/40">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 border-b-2 border-primary/80 animate-scan" />
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-12 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
          >
            <QrCode className="h-12 w-12 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Drop a QR image here, upload one, or use your camera.</p>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {camOn ? (
            <Button variant="surface" onClick={stopCam}><CameraOff /> Stop camera</Button>
          ) : (
            <Button variant="hero" onClick={startCam}><Camera /> Use camera</Button>
          )}
          <Button variant="surface" onClick={() => fileRef.current?.click()}><ImageUp /> Upload image</Button>
          <Button variant="ghost" onClick={() => handleDecoded(SAMPLES.qr)}><Sparkles /> Try sample QR content</Button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </div>
      </div>
      {loading && <p className="mt-6 flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Analysing destination…</p>}
      {content && (
        <div className="glass mt-6 rounded-xl p-4">
          <p className="font-mono text-xs uppercase text-muted-foreground">QR content</p>
          <p className="mt-1 break-all font-mono text-sm">{content}</p>
        </div>
      )}
      {result && <ResultView result={result} />}
    </Page>
  );
}
