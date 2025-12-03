import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { geminiService } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import TaskBoard from './components/TaskBoard';
import { Message, Task, ToolName } from './types';
import { FunctionCallPart, FunctionResponsePart } from '@google/genai';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Chat Session
  useEffect(() => {
    const chat = geminiService.initializeChat();
    if (chat) {
        setIsInitialized(true);
        // Initial greeting
        setMessages([{
            id: 'init',
            role: 'model',
            text: "Hey! Aarika here. 👋\n\nKaise ho? Ready to crush some goals today? Bataiye, kya plan hai? I can help with reminders or task suggestions.",
            timestamp: new Date()
        }]);
    } else {
        setMessages([{
            id: 'error',
            role: 'system',
            text: "Error: API Key is missing. Please check your environment configuration.",
            timestamp: new Date(),
            isError: true
        }]);
    }
  }, []);

  // Tool Handlers
  const handleTools = useCallback(async (functionCalls: FunctionCallPart[]) => {
    const responses: FunctionResponsePart[] = [];
    let taskUpdated = false;

    for (const call of functionCalls) {
      const { name, args } = call.functionCall;
      // Explicitly type result as Record<string, any> to allow overwriting with { message: ... } later
      let result: Record<string, any> = { status: 'ok' };
      
      console.log(`Executing tool: ${name} with args:`, args);

      if (name === ToolName.ADD_TASK) {
        const newTask: Task = {
          id: uuidv4(),
          title: args.title as string,
          priority: (args.priority as 'low' | 'medium' | 'high') || 'medium',
          status: 'pending'
        };
        setTasks(prev => [...prev, newTask]);
        result = { message: `Task "${newTask.title}" added with ${newTask.priority} priority. Ho gaya add!` };
        taskUpdated = true;
      } else if (name === ToolName.REMOVE_TASK) {
        const idToRemove = args.id as string;
        const exists = tasks.find(t => t.id === idToRemove || t.title.toLowerCase() === idToRemove.toLowerCase());
        
        if (exists) {
            setTasks(prev => prev.filter(t => t.id !== exists.id));
            result = { message: `Task "${exists.title}" removed. Hata diya list se.` };
        } else {
            // Try flexible matching if strict ID fails, usually args.id might be the title from LLM
            const matched = tasks.find(t => t.title.toLowerCase().includes(idToRemove.toLowerCase()));
             if (matched) {
                setTasks(prev => prev.filter(t => t.id !== matched.id));
                result = { message: `Task "${matched.title}" removed.` };
             } else {
                result = { message: `Task with id/title "${idToRemove}" not found.` };
             }
        }
        taskUpdated = true;
      } else if (name === ToolName.COMPLETE_TASK) {
         const idToComplete = args.id as string;
          // Logic to find task similar to removeTask
         const matched = tasks.find(t => t.id === idToComplete) || tasks.find(t => t.title.toLowerCase().includes(idToComplete.toLowerCase()));
         
         if (matched) {
            setTasks(prev => prev.map(t => t.id === matched.id ? { ...t, status: 'completed' } : t));
            result = { message: `Great job! Task "${matched.title}" marked as completed. ✅` };
            taskUpdated = true;
         } else {
            result = { message: "Task not found." };
         }
      } else if (name === ToolName.LIST_TASKS) {
          // Return the current list of tasks so the model knows what is happening
          result = { 
              tasks: tasks.map(t => ({ 
                  id: t.id, 
                  title: t.title, 
                  status: t.status, 
                  priority: t.priority 
              })),
              count: tasks.length
          };
      }

      responses.push({
        functionResponse: {
          name: name,
          response: result
        }
      });
    }

    return responses;
  }, [tasks]);

  const handleSendMessage = async (text: string) => {
    if (!isInitialized) return;

    const userMsgId = uuidv4();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      let response = await geminiService.sendMessage(text);
      
      // Loop to handle multiple tool calls if necessary (though simple loop usually suffices for single turn)
      // Check for tool calls in the candidates
      let toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);

      while (toolCalls && toolCalls.length > 0) {
        // Execute tools
        // We cast to any because we know it's a FunctionCallPart array due to filter
        const toolResponses = await handleTools(toolCalls as FunctionCallPart[]);
        
        // Send tool outputs back to model
        response = await geminiService.sendToolResponse(toolResponses);
        
        // Check if model wants to call more tools or just give text
        toolCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
      }

      // Extract final text
      const botText = response.text || "List updated!";
      
      // Handle TTS if enabled
      let audioData: string | undefined = undefined;
      if (ttsEnabled) {
        const audio = await geminiService.generateSpeech(botText);
        if (audio) {
            audioData = audio;
            // Auto play
            const audioEl = new Audio(`data:audio/mp3;base64,${audio}`);
            audioEl.play().catch(e => console.error("Auto-play failed", e));
        }
      }

      const newBotMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: botText,
        timestamp: new Date(),
        audioData
      };

      setMessages(prev => [...prev, newBotMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'system',
        text: "Sorry, thoda connection issue lag raha hai. Can we try again?",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  return (
    <div className="flex h-full w-full bg-slate-100 p-4 md:p-6 gap-6 relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-600/10 to-transparent -z-10 pointer-events-none" />

      {/* Main Grid */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full h-full">
        
        {/* Left Panel: Chat */}
        <div className="flex-[2] h-full min-w-0">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onToggleTTS={() => setTtsEnabled(!ttsEnabled)}
            ttsEnabled={ttsEnabled}
          />
        </div>

        {/* Right Panel: Task Board */}
        <div className="flex-1 h-full min-w-0 hidden md:block">
           <TaskBoard 
             tasks={tasks} 
             onComplete={handleTaskComplete}
             onDelete={handleTaskDelete}
           />
        </div>

        {/* Mobile Task Drawer Toggle (Visual only for now, assumes desktop first for complexity reduction in this demo) */}
      </div>
    </div>
  );
}

export default App;