import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  status: string;
  userId: string;
  order: number;
}

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    createTask: (state, action: PayloadAction<Task>) => {
      const tasksInSameStatus = state.tasks.filter(t => t.status === action.payload.status);
      const maxOrder = tasksInSameStatus.length > 0 
        ? Math.max(...tasksInSameStatus.map(t => t.order || 0))
        : -1;
      state.tasks.push({
        ...action.payload,
        order: maxOrder + 1
      });
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
  },
});

export const { createTask, updateTask, deleteTask } = tasksSlice.actions;
export default tasksSlice.reducer;