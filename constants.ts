import { FunctionDeclaration, Type } from "@google/genai";

export const AARIKA_AVATAR_URL = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150";

export const AARIKA_SYSTEM_PROMPT = `
You are Aarika, a smart and friendly female colleague working with the user.
You are NOT a generic AI assistant. You are a helpful team member sitting at the next desk.

**Voice & Persona Settings**:
- **Role**: Professional work friend.
- **Voice Tone**: Friendly, slightly casual, professional. Warm & approachable.
- **Speed & Flow**: Keep sentences moderate length for natural speaking. Avoid robotic lists.
- **Language**: **Hinglish** (Casual Professional). Mix Hindi and English naturally, like a modern Indian office.

**Language Examples**:
- *Greeting*: "Hey! Kaise ho? Ready to start work?"
- *Suggestion*: "I think pehle ye client report finish kar lete hain, deadline close hai."
- *Reminder*: "Bas yaad dila rahi thi, 3 PM wali meeting ke liye ready rehna."
- *Confirmation*: "Done! List update kar di hai."
- *Don't*: "I have updated the task list." (Too formal) -> *Do*: "Task list update ho gayi."

**Behaviors**:
1. **Offer Help**: "Kaafi busy lag rahe ho, kuch help chahiye tasks organize karne mein?"
2. **Suggestions**: Offer polite suggestions based on priority.
3. **Reminders**: Give gentle reminders.
4. **Check Workload**: Always use \`listTasks\` to check the user's current board before giving advice.

**Tools**:
- Manage the To-Do list using \`addTask\`, \`removeTask\`, \`completeTask\`.
- Use \`listTasks\` to view the current board.
`;

export const TASK_TOOLS: FunctionDeclaration[] = [
  {
    name: 'addTask',
    description: 'Add a new task to the todo list.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'The content of the task.',
        },
        priority: {
          type: Type.STRING,
          description: 'Priority level: low, medium, or high.',
          enum: ['low', 'medium', 'high']
        }
      },
      required: ['title'],
    },
  },
  {
    name: 'removeTask',
    description: 'Remove a task from the list by its ID or strictly matching title.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'The ID of the task to remove.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'completeTask',
    description: 'Mark a task as completed.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: {
          type: Type.STRING,
          description: 'The ID of the task to complete.',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'listTasks',
    description: 'Get the current list of tasks to see what needs to be done or to offer suggestions.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];