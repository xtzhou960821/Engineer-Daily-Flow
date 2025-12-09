import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: '你好！我是你的工程助手。关于今天的日程、API 学习或者桥梁检测有什么问题吗？' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialize Chat Session
  useEffect(() => {
    const apiKey = process.env.API_KEY;
    
    // Debug log (Do not log the actual key in production, just existence)
    if (!apiKey) {
      console.warn("API_KEY is missing from process.env");
    } else {
      console.log("API_KEY is present");
    }

    if (!chatSessionRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are a helpful assistant for a bridge inspection engineer and software developer. You are concise, professional, and encouraging. Your user has a schedule involving bridge inspection field work and learning software development (API, database). Answer in Chinese."
                }
            });
        } catch (error) {
            console.error("Failed to initialize AI", error);
        }
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        if (!chatSessionRef.current) {
             throw new Error("Chat session not initialized");
        }
        
        // Streaming response
        const result = await chatSessionRef.current.sendMessageStream({ message: userText });
        
        let fullText = '';
        const modelMsgId = (Date.now() + 1).toString();
        
        // Add placeholder for model message
        setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);
        
        for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
                fullText += c.text;
                setMessages(prev => 
                    prev.map(msg => msg.id === modelMsgId ? { ...msg, text: fullText } : msg)
                );
            }
        }
    } catch (error: any) {
        console.error("Chat error", error);
        
        let errorMessage = "连接服务器失败，请稍后再试。";
        const errorStr = error.toString().toLowerCase();
        
        // Detailed Error Handling
        if (errorStr.includes('api key') || errorStr.includes('403')) {
             errorMessage = "API Key 认证失败。请检查 Netlify 环境变量配置，或确保已在 Google Cloud 中启用 'Generative Language API'。推荐使用 Google AI Studio 获取 Key。";
        } else if (errorStr.includes('404') || errorStr.includes('not found')) {
             errorMessage = "模型未找到。可能是当前 API Key 不支持该模型，或者模型名称有误。";
        } else if (errorStr.includes('429')) {
             errorMessage = "请求过于频繁 (Rate Limit)，请稍作休息再试。";
        } else if (errorStr.includes('fetch')) {
             errorMessage = "网络请求失败，请检查网络连接。";
        }

        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: errorMessage,
            isError: true
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'}`}
        aria-label="Open Chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 z-50 w-[90vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`} style={{ height: '500px', maxHeight: '70vh' }}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-indigo-600 rounded-t-2xl flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-100" />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">AI 助手</h3>
                <p className="text-indigo-200 text-xs">Gemini 2.5 Flash</p>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : (msg.isError 
                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none flex items-start gap-2' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none')
                    }`}>
                        {msg.isError && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        <span className="text-xs text-slate-400">思考中...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="flex gap-2 items-center bg-slate-100 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-colors">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="问点什么..."
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-1.5 rounded-full transition-colors ${
                        inputValue.trim() && !isLoading 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;