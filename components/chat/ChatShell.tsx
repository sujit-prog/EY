"use client";

import { RefObject, KeyboardEvent } from "react";
import { ChatMessage, Stage } from "@/app/loan/chat/page";
import MessageBubble from "./MessageBubble";
import StageIndicator from "./StageIndicator";
import SuggestionChips from "./SuggestionChips";
import TypingIndicator from "./TypingIndicator";

interface ChatShellProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  stage: Stage;
  suggestions: string[];
  error: string | null;
  messagesEndRef: RefObject<HTMLDivElement>;
}

export default function ChatShell({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  stage,
  suggestions,
  error,
  messagesEndRef,
}: ChatShellProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-96px)] flex-col rounded-2xl border bg-white shadow-sm">
      <StageIndicator stage={stage} />

      {error && (
        <div className="mx-4 mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-2 flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t px-4 py-3 space-y-2">
        <SuggestionChips
          suggestions={suggestions}
          disabled={isLoading}
          onClick={(s) => onSend(s)}
        />

        <div className="flex items-end gap-2">
          <textarea
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm text-black placeholder-neutral-800 outline-none focus:ring-1 focus:ring-sky-800"
            rows={2}
            placeholder="Type your question or ask to start verification…"
            value={input}
            disabled={isLoading}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="inline-flex h-9 items-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white disabled:opacity-50"
            disabled={!input.trim() || isLoading}
            onClick={() => onSend(input)}
          >
            Send
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          This is a demo experience. Please don’t share real personal
          information.
        </p>
      </div>
    </div>
  );
}
