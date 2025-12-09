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
  const [configError, setConfigError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Helper to safely get API Key from various sources
  const getApiKey = (): string | undefined => {
    let key = '';

    // 1. Try Vite standard (import.meta.env) - Recommended for this project structure
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        key = import.meta.env.VITE_API_KEY || '';
      }
    } catch (e) {}

    // 2. Try process.env (Legacy/Webpack/Node/System)
    // This is required by Google GenAI SDK guidelines as the primary source in many environments
    if (!key) {
      try {
        if (typeof process !== 'undefined' && process.env) {
          key = process.env.VITE_API_KEY || process.env.API_KEY || '';
        }
      } catch (e) {}
    }
    
    return key.trim();
  };

  // Initialize Chat Session
  const initChat = () => {
    const apiKey = getApiKey();
    console.log("Initializing Chat...");
    
    // 1. Check for API Key existence
    if (!apiKey) {
      const errorMsg = "配置错误: 未检测到 API Key。\n\n本地开发: 请在项目根目录 .env 文件中添加 'VITE_API_KEY=AIza...'\n\nNetlify: 请在 Environment variables 中添加 'VITE_API_KEY'。\n\n(添加变量后重启服务或重新部署)";
      setConfigError(errorMsg);
      if (!messages.some(m => m.id === 'sys-err-key')) {
          setMessages(prev => [...prev, { id: 'sys-err-key', role: 'model', text: errorMsg, isError: true }]);
      }
      return;
    }

    // 2. Initialize Gemini Client
    // We removed strict format validation to avoid blocking valid keys that might look different or be proxy keys.
    if (!chatSessionRef.current) {
        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are a helpful assistant for a bridge inspection engineer and software developer. You are concise, professional, and encouraging. Your user has a schedule involving bridge inspection field work and learning software development (API, database). Answer in Chinese."
                }
            });
            console.log("Gemini Client Initialized");
            setConfigError(null); 
            
            // Remove error messages if they exist
            setMessages(prev => prev.filter(m => !m.isError));
            
        } catch (error: any) {
            console.error("Failed to initialize AI", error);
            const errorText = `初始化异常: ${error.message}`;
            setConfigError(errorText);
            setMessages(prev => [...prev, { id: 'init-err', role: 'model', text: errorText, isError: true }]);
        }
    }
  };

  useEffect(() => {
    initChat();
  }, [isOpen]); 

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || configError) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        // Double check session
        if (!chatSessionRef.current) {
             initChat();
             if (!chatSessionRef.current) throw new Error("无法创建聊天会话 (API Key 可能无效)");
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
        console.error("Chat error details:", error);
        
        let friendlyMessage = "连接服务器失败。";
        const errorStr = error.toString().toLowerCase();
        const rawMessage = error.message || JSON.stringify(error);

        // Detailed Error Handling
        if (errorStr.includes('403') || errorStr.includes('permission')) {
             friendlyMessage = "API 权限不足 (403)。\n\n1. 请确保 Google Cloud Console 中已启用 'Generative Language API'。\n2. 检查 API Key 是否正确。\n3. 如果设置了 Key 限制，请检查 Referrer。";
        } else if (errorStr.includes('404') || errorStr.includes('not found')) {
             friendlyMessage = "模型不可用 (404)。\n该 API Key 可能无法访问 gemini-2.5-flash。";
        } else if (errorStr.includes('400') || errorStr.includes('invalid argument')) {
             friendlyMessage = "请求无效 (400)。\nAPI Key 格式可能错误，或包含了多余字符。";
        } else if (errorStr.includes('429')) {
             friendlyMessage = "请求过于频繁，请稍后再试。";
        }
        
        // Append Raw Error for Debugging
        const debugMessage = `${friendlyMessage}\n\n[调试信息]: ${rawMessage}`;

        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: debugMessage,
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
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${configError ? 'bg-red-400' : 'bg-green-400'}`}></span>
                  <p className="text-indigo-200 text-xs">Gemini 2.5 Flash</p>
                </div>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm whitespace-pre-wrap break-words ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : (msg.isError 
                            ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none flex flex-col gap-1' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none')
                    }`}>
                        {msg.isError && (
                          <div className="flex items-center gap-1 font-bold border-b border-red-100 pb-1 mb-1">
                             <AlertCircle className="w-4 h-4" /> 
                             <span>出错了</span>
                          </div>
                        )}
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
            <div className={`flex gap-2 items-center rounded-full px-4 py-2 border transition-colors ${configError ? 'bg-slate-50 border-slate-200' : 'bg-slate-100 border-transparent focus-within:border-indigo-300 focus-within:bg-white'}`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={configError ? "配置错误，无法发送" : "问点什么..."}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
                    disabled={isLoading || !!configError}
                />
                <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading || !!configError}
                    className={`p-1.5 rounded-full transition-colors ${
                        inputValue.trim() && !isLoading && !configError
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