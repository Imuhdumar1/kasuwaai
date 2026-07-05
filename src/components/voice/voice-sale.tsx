"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Pause, Play, RotateCcw, Trash2, Sparkles, ArrowLeft } from "lucide-react";
import { Button, Card, Textarea, Badge, Select } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { SaleForm, type CustomerLite, type ProductLite, type SaleInitial } from "@/components/sales/sale-form";
import { useI18n } from "@/components/providers";
import { parseTransaction, type ParsedSale } from "@/lib/voice/parse";

type RecState = "idle" | "recording" | "paused" | "recorded";

/* ─── Minimal Web Speech API typings (not in the standard lib) ─────────── */
type SRAlternative = { transcript: string };
type SRResult = { isFinal: boolean; readonly length: number; [i: number]: SRAlternative };
type SRResultList = { readonly length: number; [i: number]: SRResult };
type SREvent = { resultIndex: number; results: SRResultList };
interface SpeechRec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type SRConstructor = new () => SpeechRec;

function getSpeechRecognition(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const EXAMPLES = [
  "Three bags of rice sold to Haruna for one hundred and eighty thousand naira. He paid one hundred thousand.",
  "Haruna ya sayi bags uku na shinkafa akan naira dubu dari da tamanin. Ya biya naira dubu dari.",
  "Sold 2 cartons of milk to Amina for 15000, she paid 5000.",
];

export function VoiceSale({
  customers,
  products,
  currency,
}: {
  customers: CustomerLite[];
  products: ProductLite[];
  currency: string;
}) {
  const { t } = useI18n();
  const [stage, setStage] = useState<"capture" | "review">("capture");
  const [rec, setRec] = useState<RecState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [recLang, setRecLang] = useState("en-NG");
  const [parsed, setParsed] = useState<ParsedSale | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recogRef = useRef<SpeechRec | null>(null);
  const finalRef = useRef("");
  const activeRef = useRef(false);
  const userStopRef = useRef(false);

  const speechSupported = getSpeechRecognition() !== null;

  useEffect(() => {
    return () => {
      try {
        recogRef.current?.abort();
      } catch {
        /* noop */
      }
      streamRef.current?.getTracks().forEach((tk) => tk.stop());
    };
  }, []);

  function startSpeech() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const recog = new SR();
    recog.lang = recLang;
    recog.continuous = true;
    recog.interimResults = true;
    finalRef.current = "";
    userStopRef.current = false;
    activeRef.current = true;
    recog.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finalRef.current += txt + " ";
        else live += txt;
      }
      setInterim(live);
    };
    recog.onend = () => {
      // Chrome ends on silence — restart while the user is still recording.
      if (activeRef.current && !userStopRef.current) {
        try {
          recog.start();
          return;
        } catch {
          /* fall through to finalize */
        }
      }
      setInterim("");
      const finalText = finalRef.current.trim();
      if (finalText) setTranscript(finalText);
    };
    recog.onerror = () => {
      /* keep the audio recording going; the user can still type */
    };
    recogRef.current = recog;
    try {
      recog.start();
    } catch {
      /* already started / unsupported */
    }
  }

  async function startRecording() {
    setRecError(null);
    setInterim("");

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setRecError(
        "Recording needs a secure page. Open the app directly at http://localhost:3300 (not inside a preview frame). You can still type the sale below.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecError(
        "In-app recording isn't available here (the embedded preview blocks the mic). Open http://localhost:3300 in a normal browser tab, or just type the sale below.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((tk) => tk.stop());
        setRec("recorded");
      };
      mr.start();
      mrRef.current = mr;
      setRec("recording");
      setTranscript("");
      startSpeech(); // transcribe in parallel; committed to the box on stop
      if (!speechSupported) {
        setRecError("Your browser can't auto-transcribe (try Chrome). Recording still works — type what you said below.");
      }
    } catch (err) {
      const name = (err as Error)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") {
        setRecError(
          "Microphone permission was blocked. If you're inside the preview panel, open the app in a real browser tab (http://localhost:3300) and allow the mic. Or just type the sale below.",
        );
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setRecError("No microphone was found on this device. Type what was said below instead.");
      } else {
        setRecError("Couldn't start recording here. You can type what was said below instead.");
      }
    }
  }

  function pause() {
    mrRef.current?.pause();
    setRec("paused");
  }
  function resume() {
    mrRef.current?.resume();
    setRec("recording");
  }
  function stop() {
    userStopRef.current = true;
    activeRef.current = false;
    try {
      recogRef.current?.stop();
    } catch {
      /* noop */
    }
    mrRef.current?.stop();
  }
  function reset() {
    try {
      recogRef.current?.abort();
    } catch {
      /* noop */
    }
    activeRef.current = false;
    setAudioUrl(null);
    setInterim("");
    chunksRef.current = [];
    setRec("idle");
  }

  function processWithAI() {
    const p = parseTransaction(transcript, { products, customers });
    setParsed(p);
    setStage("review");
  }

  if (stage === "review" && parsed) {
    const initial: SaleInitial = {
      customer_id: parsed.customerId,
      items: parsed.items.map((it) => ({
        product_id: it.productId,
        product_name: it.name,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        cost_price: it.costPrice,
      })),
      amount_paid: parsed.amountPaid,
      notes: transcript,
    };
    return (
      <div className="animate-fade-up">
        <button onClick={() => setStage("capture")} className="mb-4 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content">
          <ArrowLeft className="h-4 w-4" /> Back to transcript
        </button>
        <h1 className="mb-2 font-display text-2xl font-extrabold sm:text-3xl">Review &amp; save</h1>
        <p className="mb-4 text-sm text-content-muted">
          The AI extracted this from your words. Check every field and edit anything before saving —
          nothing is saved automatically.
        </p>

        <Card className="mb-4 border-lime/40 bg-lime/[0.06] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-content-muted">
            <Sparkles className="h-4 w-4 text-lime-dark" /> Extracted
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {parsed.customerName && (
              <Badge tone="lime">
                Customer: {parsed.customerName}
                {parsed.customerId ? "" : " (not saved yet)"}
              </Badge>
            )}
            {parsed.items.map((it, i) => (
              <Badge key={i} tone="neutral">
                {it.quantity} × {it.name}
              </Badge>
            ))}
            {parsed.total > 0 && <Badge tone="neutral">Total ~ {parsed.total.toLocaleString()}</Badge>}
          </div>
        </Card>

        <SaleForm customers={customers} products={products} currency={currency} initial={initial} source="voice" />
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.voice")} description="Record a sale by speaking — English, Hausa, or both." />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recorder */}
        <Card className="p-6">
          <h3 className="mb-1 font-display font-bold">1. Record</h3>
          <p className="mb-4 text-sm text-content-muted">
            Speak naturally, then press stop. Your words are transcribed automatically and appear in the
            transcript when you stop.
          </p>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-medium text-content-muted">Speech language</span>
            <Select
              value={recLang}
              onChange={(e) => setRecLang(e.target.value)}
              disabled={rec === "recording" || rec === "paused"}
              className="h-8 w-auto py-0 text-xs"
            >
              <option value="en-NG">English (Nigeria)</option>
              <option value="en-US">English (US)</option>
              <option value="ha-NG">Hausa</option>
            </Select>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-2 py-8">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full ${rec === "recording" ? "animate-pulse bg-danger text-white" : "bg-ink text-paper"}`}>
              <Mic className="h-8 w-8" />
            </div>
            <div className="mt-3 text-sm font-medium">
              {rec === "idle" && "Ready"}
              {rec === "recording" && "Listening…"}
              {rec === "paused" && "Paused"}
              {rec === "recorded" && "Recorded"}
            </div>

            {(rec === "recording" || rec === "paused") && interim && (
              <p className="mt-2 max-w-xs text-center text-xs italic text-content-muted">{interim}</p>
            )}

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {rec === "idle" && (
                <Button onClick={startRecording}>
                  <Mic className="h-4 w-4" /> Start
                </Button>
              )}
              {rec === "recording" && (
                <>
                  <Button variant="outline" onClick={pause}>
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                  <Button variant="danger" onClick={stop}>
                    <Square className="h-4 w-4" /> Stop
                  </Button>
                </>
              )}
              {rec === "paused" && (
                <>
                  <Button onClick={resume}>
                    <Play className="h-4 w-4" /> Resume
                  </Button>
                  <Button variant="danger" onClick={stop}>
                    <Square className="h-4 w-4" /> Stop
                  </Button>
                </>
              )}
              {rec === "recorded" && (
                <>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4" /> Retry
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </>
              )}
            </div>

            {audioUrl && (
              <audio controls src={audioUrl} className="mt-4 w-full max-w-xs">
                <track kind="captions" />
              </audio>
            )}
          </div>
          {recError && <p className="mt-3 text-sm text-warning">{recError}</p>}
        </Card>

        {/* Transcript */}
        <Card className="p-6">
          <h3 className="mb-1 font-display font-bold">2. Transcript</h3>
          <p className="mb-4 text-sm text-content-muted">
            Your recording appears here. Correct anything (especially Hausa words), then process it.
          </p>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[140px]"
            placeholder="Your transcribed words will appear here after you stop recording — or type them in."
          />

          <div className="mt-3">
            <div className="mb-1.5 text-xs font-medium text-content-muted">No mic? Try an example:</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setTranscript(ex)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-content-muted hover:bg-surface-2 hover:text-content"
                >
                  {i === 1 ? "Hausa" : i === 0 ? "English" : "Mixed"}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={processWithAI} disabled={!transcript.trim()} className="mt-5 w-full">
            <Sparkles className="h-4 w-4" /> Process with AI
          </Button>
        </Card>
      </div>
    </div>
  );
}
