"use client";

import { ChatMessage } from "@/app/loan/chat/page";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
          isUser
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-slate-100 text-black rounded-bl-none",
          message.error ? "border border-red-400" : "",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.error && (
          <p className="mt-1 text-[10px] text-red-100">
            Failed to send. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
