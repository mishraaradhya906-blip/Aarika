import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Send, Volume2, User, Bot, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { AARIKA_AVATAR_URL } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onToggleTTS: () => void;
  ttsEnabled: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onToggleTTS,
  ttsEnabled
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; // Indian English for better Hinglish support
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + ' ' : '') + transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition", err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const playAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    audio.play();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-indigo-600 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={AARIKA_AVATAR_URL} 
              alt="Aarika" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-600 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Aarika</h2>
            <p className="text-indigo-200 text-xs">Virtual Work Assistant</p>
          </div>
        </div>
        <button 
          onClick={onToggleTTS}
          className={`p-2 rounded-full transition-colors ${ttsEnabled ? 'bg-white text-indigo-600' : 'bg-indigo-700 text-indigo-300 hover:bg-indigo-500'}`}
          title={ttsEnabled ? "Mute Voice" : "Enable Voice"}
        >
          <Volume2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 opacity-80 shadow-lg border-4 border-white">
                 <img src={AARIKA_AVATAR_URL} alt="Aarika" className="w-full h-full object-cover" />
            </div>
            <p>Say "Hi" to start working with Aarika!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-slate-200 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-white'}`}>
                {msg.role === 'user' ? (
                  <User size={16} className="text-slate-500" /> 
                ) : (
                  <img src={AARIKA_AVATAR_URL} alt="Aarika" className="w-full h-full object-cover" />
                )}
              </div>

              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.audioData && (
                   <button 
                     onClick={() => msg.audioData && playAudio(msg.audioData)}
                     className="mt-2 text-xs flex items-center gap-1 text-indigo-600 font-medium hover:underline"
                   >
                     <Volume2 size={12} /> Replay Voice
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex justify-start">
             <div className="flex flex-row items-start gap-2">
               <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                  <img src={AARIKA_AVATAR_URL} alt="Aarika" className="w-full h-full object-cover" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                 <Loader2 size={16} className="text-indigo-600 animate-spin" />
                 <span className="text-xs text-slate-500">Aarika is thinking...</span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 shrink-0">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or dictate a task..."
                className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 placeholder-slate-400 transition-all"
                disabled={isLoading}
             />
             <button
               type="button"
               onClick={toggleListening}
               className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${
                 isListening 
                   ? 'bg-rose-100 text-rose-600 animate-pulse' 
                   : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200'
               }`}
               title={isListening ? "Stop Listening" : "Start Dictation"}
             >
               {isListening ? <MicOff size={18} /> : <Mic size={18} />}
             </button>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !inputText.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          {isListening ? (
            <span className="text-rose-500 font-medium animate-pulse">Listening... Speak now</span>
          ) : (
            "Aarika can make mistakes. Please double check important information."
          )}
        </p>
      </form>
    </div>
  );
};

export default ChatInterface;