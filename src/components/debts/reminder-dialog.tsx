"use client";

import { useEffect, useState } from "react";
import { MessageCircle, MessageSquare, Copy, Check } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Textarea } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { buildReminder, toWaNumber, toSmsNumber, type ReminderTone, type DueBucket } from "@/lib/reminders";

export type ReminderTarget = {
  customerName: string;
  phone: string | null;
  whatsapp: string | null;
  amount: number;
  dueDate: string | null;
  bucket: DueBucket;
};

export function ReminderDialog({
  open,
  onClose,
  target,
  businessName,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  target: ReminderTarget | null;
  businessName: string;
  currency: string;
}) {
  const { lang } = useI18n();
  const [tone, setTone] = useState<ReminderTone>("friendly");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !target) return;
    setMessage(
      buildReminder({
        customerName: target.customerName,
        businessName,
        amount: target.amount,
        currency,
        dueDate: target.dueDate,
        bucket: target.bucket,
        tone,
        lang,
      }),
    );
    setCopied(false);
  }, [open, target, tone, lang, businessName, currency]);

  if (!target) return null;

  const wa = toWaNumber(target.whatsapp || target.phone);
  const sms = toSmsNumber(target.phone || target.whatsapp);
  const encoded = encodeURIComponent(message);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the user can still select the text */
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Payment reminder" description={target.customerName} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-muted">Tone</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-line">
            {(["friendly", "firm"] as ReminderTone[]).map((tn) => (
              <button
                key={tn}
                onClick={() => setTone(tn)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  tone === tn ? "bg-ink text-paper" : "bg-surface text-content-muted hover:bg-surface-2"
                }`}
              >
                {tn}
              </button>
            ))}
          </div>
        </div>

        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[130px]" />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button variant="outline" onClick={copy}>
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>

          {wa ? (
            <a href={`https://wa.me/${wa}?text=${encoded}`} target="_blank" rel="noopener noreferrer">
              <Button className="w-full" style={{ background: "#25D366", color: "#0a0a0a" }}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
            </a>
          ) : (
            <Button disabled title="No number on file">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          )}

          {sms ? (
            <a href={`sms:${sms}?body=${encoded}`}>
              <Button variant="dark" className="w-full">
                <MessageSquare className="h-4 w-4" /> SMS
              </Button>
            </a>
          ) : (
            <Button variant="dark" disabled title="No number on file">
              <MessageSquare className="h-4 w-4" /> SMS
            </Button>
          )}
        </div>

        {!wa && !sms && (
          <p className="text-xs text-content-muted">
            No phone/WhatsApp number saved for this customer — add one on their profile to send directly. You can still
            copy the message.
          </p>
        )}
      </div>
    </Modal>
  );
}
