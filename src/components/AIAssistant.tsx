"use client";
import { useState, useRef, useEffect } from "react";
import { useAppState } from "@/lib/store";
import { Bot, X, Send, Cpu, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  source?: string;
  affectedIds?: string[];
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello. I am the AI Operational Assistant. I can analyze the current application state for you. Ask me about high-risk tasks, conflicts, or harvesting opportunities.",
      source: "System Initialization"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state } = useAppState();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const generateResponse = (query: string): Message => {
    const q = query.toLowerCase();
    
    // Deterministic matching
    if (q.includes("high-risk") || q.includes("due today")) {
      const highRisk = state.tasks.filter(t => t.riskScore > 80 && t.status !== "COMPLETED");
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: `Found ${highRisk.length} high-risk tasks requiring immediate attention. Priority factors include high traffic density and overdue inspections.`,
        source: "State: state.tasks (riskScore > 80)",
        affectedIds: highRisk.map(t => t.id)
      };
    }

    if (q.includes("kota–itarsi") || q.includes("kota-itarsi")) {
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "KOTA-ITARSI was selected due to a critical systemic anomaly detected (Cluster of Rail Fractures) and highest traffic density weighting in the network model.",
        source: "State: state.corridors & Anomaly Engine",
        affectedIds: ["C-KOTA-ITARSI"]
      };
    }

    if (q.includes("conflict") && q.includes("block")) {
      const blocks = state.blocks;
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "Detected potential resource contention in active blocks sharing TRD resources on overlapping timelines.",
        source: "State: state.blocks (time overlap analysis)",
        affectedIds: blocks.slice(0, 2).map(b => b.id)
      };
    }

    if (q.includes("harvest")) {
      const pendingTasks = state.tasks.filter(t => t.status === "PENDING").slice(0, 3);
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "There are multiple pending tasks within 5km of currently approved blocks that require no additional specialized machinery.",
        source: "State: state.tasks & state.blocks (geospatial match)",
        affectedIds: pendingTasks.map(t => t.id)
      };
    }

    if (q.includes("defer") && (q.includes("trk-") || q.includes("task"))) {
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "Deferring this task will escalate its risk score beyond the critical threshold (90+) within 48 hours, likely forcing a Temporary Speed Restriction (TSR).",
        source: "State: state.tasks (Risk Projection Model)",
        affectedIds: ["TRK-1042"] // Faked deterministic ID
      };
    }

    if (q.includes("goods traffic") || q.includes("increase")) {
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "An increase in goods traffic will invalidate 2 currently approved blocks on the main freight corridor due to insufficient headway.",
        source: "State: state.goodsForecasts & state.blockWindows",
        affectedIds: state.blocks.slice(0,2).map(b => b.id)
      };
    }

    if (q.includes("unused capacity") || q.includes("approved")) {
      const lowUtil = state.blocks.filter(b => b.utilization < 70);
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: `Found ${lowUtil.length} approved blocks with less than 70% utilization. These are prime candidates for block harvesting.`,
        source: "State: state.blocks (utilization < 70)",
        affectedIds: lowUtil.map(b => b.id)
      };
    }

    if (q.includes("changed") && q.includes("replan")) {
      const replans = state.auditLogs.filter(a => a.event.includes("REPLAN_APPLIED"));
      if (replans.length > 0) {
        return {
          id: Date.now().toString(),
          sender: "ai",
          text: `The latest replan was for: ${replans[replans.length - 1].entity}. ${replans[replans.length - 1].reason}`,
          source: "State: state.auditLogs",
          affectedIds: [replans[replans.length - 1].entity]
        };
      }
      return {
        id: Date.now().toString(),
        sender: "ai",
        text: "No emergency replans have been applied in the current session.",
        source: "State: state.auditLogs",
        affectedIds: []
      };
    }

    return {
      id: Date.now().toString(),
      sender: "ai",
      text: "I can only answer specific queries about the current prototype state, such as high-risk tasks, conflicts, harvesting, and recent replan impacts. Please rephrase.",
      source: "Fallback Parser"
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString() + "-u", sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = generateResponse(userMsg.text);
      setMessages(prev => [...prev, aiResponse]);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-800 transition-all z-50 border-2 border-indigo-400 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Cpu className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-md shadow-2xl flex flex-col z-50 border border-slate-300 transition-all origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-4 rounded-t-md flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-800 rounded flex items-center justify-center border border-indigo-700 shadow-inner">
              <Bot className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">AI Operational Assistant</div>
              <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">Prototype Decision Support</div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-indigo-300 hover:text-white p-1 rounded hover:bg-indigo-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded p-3 shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1 text-indigo-700 font-bold text-[10px] uppercase tracking-wider">
                    <Cpu className="h-3 w-3" /> RailNiyojak AI
                  </div>
                )}
                
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                
                {msg.sender === 'ai' && msg.source && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-start gap-1 text-[10px] text-slate-500 font-mono">
                      <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>Context: {msg.source}</span>
                    </div>
                    {msg.affectedIds && msg.affectedIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {msg.affectedIds.map(id => (
                          <span key={id} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                            {id}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white rounded-b-md flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about current state..."
            className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 text-slate-900"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
