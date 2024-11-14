export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface TaskModel {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority[];
  dueDate: Date | null;
  status: TaskStatus[];
  userId: string;
}
