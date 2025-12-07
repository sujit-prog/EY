"use client";

import { useEffect, useRef, useState } from "react";
import ChatShell from "@/components/chat/ChatShell";

export type Role = "user" | "assistant";

export type Stage = "intro" | "verification" | "underwriting" | "offer";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  error?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I’m your loan assistant. I can help you with eligibility, verification and underwriting. How would you like to start?",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isLoading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the whole conversation to backend
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stage,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      /**
       * Expected backend shape (you can align with Aditi):
       * {
       *   reply: string;
       *   stage?: Stage;
       * }
       */
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply ?? "Sorry, I could not understand that.",
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.stage) setStage(data.stage as Stage);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === userMessage.id ? { ...m, error: true } : m
        )
      );
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // For suggestion chips
  const suggestionsByStage: Record<Stage, string[]> = {
    intro: [
      "Check my loan eligibility",
      "What documents do you need?",
      "Show me interest rates",
    ],
    verification: ["Start KYC verification", "Verify my PAN", "Verify Aadhaar"],
    underwriting: [
      "Explain my loan offer",
      "Why is my approved amount low?",
      "What if I change tenure?",
    ],
    offer: ["Show final summary", "Accept my offer", "Change my EMI amount"],
  };

  const suggestions = suggestionsByStage[stage];

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <header className="w-full border-b bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-600" />
            <div>
              <div className="text-sm font-semibold text-sky-800">
                Loan Assistant
              </div>
              <div className="text-[11px] text-slate-500">
                Guided loan journey – chat based
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">Sandbox environment</div>
        </div>
      </header>

      <section className="flex-1 flex">
        <div className="flex-1 flex justify-center px-2 py-4">
          <div className="w-full max-w-2xl">
            <ChatShell
              messages={messages}
              input={input}
              onInputChange={setInput}
              onSend={sendMessage}
              isLoading={isLoading}
              stage={stage}
              suggestions={suggestions}
              error={error}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
