// components/chat/ChatShell.tsx
import { useEffect, useRef } from "react";
import { StageIndicator } from "./StageIndicator";
import { MessageBubble } from "./MessageBubble";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  isError?: boolean;
  agentLabel?: string;
}

interface ChatShellProps {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
  currentStage: "discovery" | "sales" | "verification" | "underwriting" | "sanctioned";
  lowLevelError?: string | null;
}

export function ChatShell({
  messages,
  input,
  setInput,
  sendMessage,
  isLoading,
  suggestions,
  onSuggestionClick,
  currentStage,
  lowLevelError,
}: ChatShellProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) sendMessage();
    }
  };

  // Get stage display info
  const getStageInfo = () => {
    switch (currentStage) {
      case "discovery":
        return { label: "Discovery", color: "from-blue-500/20 to-cyan-500/20", icon: "🔍" };
      case "sales":
        return { label: "Sales & Offers", color: "from-purple-500/20 to-pink-500/20", icon: "💰" };
      case "verification":
        return { label: "Verification", color: "from-amber-500/20 to-orange-500/20", icon: "📄" };
      case "underwriting":
        return { label: "Underwriting", color: "from-indigo-500/20 to-blue-500/20", icon: "⚙️" };
      case "sanctioned":
        return { label: "Sanctioned", color: "from-emerald-500/20 to-green-500/20", icon: "✅" };
      default:
        return { label: "Chat", color: "from-slate-500/20 to-slate-500/20", icon: "💬" };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
        {/* Dynamic Glow based on stage */}
        <div className={`pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr ${stageInfo.color} blur-3xl`} />

        {/* Content */}
        <div className="relative flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-slate-50">
                  Tata Capital Loan Assistant
                </p>
                <p className="text-xs text-slate-400">
                  Powered by Multi-Agent AI System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-xs text-emerald-300">Live</span>
            </div>
          </div>

          {/* Stage Indicator */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-2xl">{stageInfo.icon}</span>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Current Stage</p>
              <p className="text-sm font-semibold text-slate-200">{stageInfo.label}</p>
            </div>
            <StageIndicator currentStage={currentStage} />
          </div>

          {/* Chat area */}
          <div
            ref={scrollRef}
            className="flex h-[450px] flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-950/60 p-4 border border-slate-800/50"
          >
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col gap-1">
                {/* Agent Label for assistant messages */}
                {m.role === "assistant" && m.agentLabel && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      {m.agentLabel}
                    </span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>
                )}
                <MessageBubble
                  role={m.role}
                  text={m.content}
                  timestamp={m.timestamp}
                  isError={m.isError}
                />
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-800/90 border border-slate-700 px-4 py-2 text-xs text-slate-300">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "300ms" }} />
                  </div>
                  Processing...
                </div>
              </div>
            )}

            {lowLevelError && (
              <div className="mx-auto mt-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-center text-xs text-red-300">
                ⚠️ {lowLevelError}
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          {suggestions.length > 0 && !isLoading && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-400 font-medium">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSuggestionClick(s)}
                    className="group flex items-center gap-2 rounded-full border border-slate-600 bg-slate-900/50 px-4 py-2 text-xs text-slate-300 transition-all hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-200 hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 shadow-lg focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Sending
                </>
              ) : (
                <>
                  Send
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-slate-500">
            Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">Enter</kbd> to send • <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">Shift + Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
}