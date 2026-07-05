"use client";

import { useRef, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Input } from "@/components/ui";
import { useI18n } from "@/components/providers";
import { answerQuestion, SUGGESTED_QUESTIONS, type AssistantSnapshot } from "@/lib/assistant/answer";

type Msg = { role: "user" | "assistant"; text: string };

export function AssistantChat({ snapshot }: { snapshot: AssistantSnapshot }) {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text:
        lang === "ha"
          ? `Sannu! Ni ne mataimakin kasuwancinka. Ka tambaye ni komai game da tallace-tallace, bashi, abokan ciniki, ko biyan kuɗi.`
          : `Hi! I'm your KasuwaAI business assistant. Ask me anything about your sales, debts, customers, or payments.`,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const answer = answerQuestion(q, snapshot, lang);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: answer }]);
    setInput("");
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title={t("nav.assistant")} description="Answers from your real business data — no guessing." />

      <div className="mx-auto flex h-[calc(100vh-220px)] max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime/25 text-ink">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user" ? "bg-ink text-paper" : "bg-surface-2 text-content"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested questions */}
        <div className="flex flex-wrap gap-2 border-t border-line p-3">
          {SUGGESTED_QUESTIONS[lang].slice(0, 4).map((qs) => (
            <button
              key={qs}
              onClick={() => ask(qs)}
              className="rounded-full border border-line px-3 py-1 text-xs text-content-muted hover:bg-surface-2 hover:text-content"
            >
              {qs}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2 border-t border-line p-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === "ha" ? "Rubuta tambayarka…" : "Ask a question…"}
          />
          <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
