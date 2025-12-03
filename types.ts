export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isError?: boolean;
  audioData?: string; // Base64 audio string if TTS is used
}

export enum ToolName {
  ADD_TASK = 'addTask',
  REMOVE_TASK = 'removeTask',
  COMPLETE_TASK = 'completeTask',
  LIST_TASKS = 'listTasks'
}

export interface ToolCallResult {
  toolName: ToolName;
  args: any;
  result: any;
}