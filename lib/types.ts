export type Source = "WhatsApp" | "LinkedIn" | "Email" | "SMS";
export type Priority = "urgent" | "important" | "normal";

export type ThreadMessage = {
  id: string;
  content: string;
  date: string;
  fromMe: boolean;
  senderName?: string;
};

export type Message = {
  id: string;
  source: Source;
  sender: string;
  initials: string;
  preview: string;
  thread: ThreadMessage[];
  date: string;
  read: boolean;
  priority: Priority;
  aiPriority: Priority;
  archived: boolean;
  pinned: boolean;
};
