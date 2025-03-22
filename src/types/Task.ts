
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Completed";
  category: "Work" | "Personal";
  dueDate: string;
  completed: boolean;
  selected: boolean;
  order: number;
  fileUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  activity?: { timestamp: string; action: string; details: string }[];
}
