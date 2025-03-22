import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../redux/taskSlice';
import { RootState, AppDispatch } from '../redux/store';
import { Task } from '../types/Task';

export default function QuickAddTask() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<'Work' | 'Personal'>('Work');
  const [status, setStatus] = useState<Task['status']>('Todo');
  const containerClassName = "hidden lg:block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    try {
      const newTask = {
        userId: user.uid,
        title: title.trim(),
        description: '',
        category,
        dueDate,
        status,
        completed: false,
        selected: false,
        fileUrl: null,
        order: Date.now() // Using timestamp as order
      };

      await dispatch(createTask(newTask));
      handleCancel();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDueDate('');
    setCategory('Work');
    setStatus('Todo');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="hidden lg:w-full lg:p-2 lg:text-left lg:text-gray-600 lg:hover:bg-gray-50 lg:rounded lg:flex lg:items-center lg:gap-2 lg:border lg:border-dashed lg:border-gray-300"
      >
        <span className="text-xl">+</span> Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full bg-white border border-gray-200 rounded-lg p-3 ${containerClassName}`}>
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-60 p-2 border rounded"
          required
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-40 p-2 border rounded"
          required
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Task['status'])}
          className="w-40 p-2 border rounded"
          required
        >
          <option value="Todo">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded ${category === 'Work' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCategory('Work')}
          >
            Work
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded ${category === 'Personal' ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCategory('Personal')}
          >
            Personal
          </button>
        </div>
      </div>

      <div className="flex gap-2 mt-4 justify-end">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}