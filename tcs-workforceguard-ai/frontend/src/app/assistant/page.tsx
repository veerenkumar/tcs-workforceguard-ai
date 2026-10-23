"use client";

import { useState, useRef, useEffect } from "react";
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Cpu,
  User,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { ChatMessageResponse, ToolCallDetail } from "@/lib/types";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  tools_called?: ToolCallDetail[];
  suggested_followups?: string[];
  timestamp: string;
}

const STARTER_QUERIES = [
  "Compare attrition rates and overtime burden across all delivery practices.",
  "What are the model evaluation metrics (ROC-AUC, Recall, Precision)?",
  "What are the primary statistical drivers of turnover?",
  "What retention interventions are active and what is their projected ROI?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "### Welcome to TCS WorkforceGuard AI Assistant\n\nI am your intelligent workforce analytics agent. I am directly connected to the FastAPI backend analytics engine, scikit-learn model evaluation pipelines, and empirical root-cause diagnostic services.\n\nAsk me anything about enterprise turnover patterns, department benchmarks, model performance, or retention program ROI.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggested_followups: STARTER_QUERIES,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend = input) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.chat(userMsg.text);
      const botMsg: Message = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text: res.reply,
        tools_called: res.tools_called,
        suggested_followups: res.suggested_followups,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        sender: "assistant",
        text: "Apologies, I encountered an issue communicating with the analytics backend. Please verify that the FastAPI backend server is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-sky-400" />
            AI Workforce Intelligence Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real backend tool execution, empirical citations, zero-hallucination deterministic fallback.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Non-punitive AI Guardrails Active</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 glass-panel rounded-2xl p-6 border border-slate-800 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-slate-700 text-slate-200"
                  : "bg-gradient-to-tr from-sky-600 to-blue-500 text-white shadow-md shadow-sky-500/20"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === "user"
                    ? "bg-sky-500 text-white font-medium"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200"
                }`}
              >
                {/* Format markdown-like text */}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>

              {/* Tools Called Badge */}
              {msg.tools_called && msg.tools_called.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.tools_called.map((tool, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono"
                    >
                      <Wrench className="w-3 h-3 text-sky-400" />
                      <span className="font-semibold text-sky-300">{tool.tool_name}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-400">{tool.execution_result_summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Followups */}
              {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold block">Suggested Questions:</span>
                  <div className="flex flex-wrap gap-2">
                    {msg.suggested_followups.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-[11px] px-3 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-slate-800 transition text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-slate-500 block px-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Querying backend analytics tools & compiling response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="shrink-0 glass-panel rounded-2xl p-2 border border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask a question (e.g. 'Compare turnover across practices' or 'What is our model recall?')..."
          disabled={sending}
          className="flex-1 bg-transparent px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={sending || !input.trim()}
          className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white transition shadow-md shadow-sky-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
