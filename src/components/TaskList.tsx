import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { RootState, AppDispatch } from "../redux/store";
import { Task } from "../types/Task";
import EditTaskModal from "./EditTaskModal";
import { updateTask, deleteBulkTasks, modifyTask, removeTask } from "../redux/taskSlice";
import toast from 'react-hot-toast';
import NoResultsFound from "./NoResultsFound";
import QuickAddTask from "./QuickAddTask"; // Import QuickAddTask component

interface TaskCardProps {
  task: Task;
  index: number;
  section: 'Todo' | 'In Progress' | 'Completed';
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, section }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Added confirm dialog state

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const dispatch = useDispatch<AppDispatch>();
  const [isSelected, setIsSelected] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id || '');
    e.dataTransfer.setData("taskIndex", index.toString());
    e.dataTransfer.setData("section", section);
    dragRef.current?.classList.add('dragging');
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSelected(e.target.checked);
    dispatch(updateTask({ ...task, selected: e.target.checked } as Task));
  };

  const handleDelete = async () => {
    console.log('DELETE OPERATION - TaskList - Starting delete for task:', task);
    try {
      if (task.id) {
        // Assuming removeTask is now correctly imported and defined.
        await dispatch(removeTask(task.id)); 
        console.log('DELETE OPERATION - TaskList - Delete dispatch completed for task ID:', task.id);
      }
    } catch (error) {
      console.error('DELETE OPERATION - TaskList - Delete failed:', error);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Task['status'];
    dispatch(updateTask({ 
      ...task, 
      status: newStatus,
      completed: newStatus === "Completed",
      category: task.category,
      dueDate: task.dueDate,
      selected: false
    } as Task));
  };

  return (
    <div 
      ref={dragRef}
      id={`task-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => {
        dragRef.current?.classList.remove('dragging');
      }}
      className="task-card bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded mb-2 border border-gray-200 hover:bg-gray-50"
    >
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 items-center">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="w-4 h-4 border-gray-300 rounded focus:ring-0"
          />
          <div className="hidden md:block drag-handle cursor-move text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </div>
        <input
          type="checkbox"
          checked={task.status === "Completed"}
          onChange={(e) => {
            const isCompleted = e.target.checked;
            dispatch(updateTask({ 
              ...task, 
              completed: isCompleted,
              category: task.category,
              dueDate: task.dueDate,
              status: isCompleted ? "Completed" : "Todo",
              selected: task.selected || false,
              activity: [
                ...(task.activity || []),
                {
                  timestamp: new Date().toISOString(),
                  action: "status_change",
                  details: `Task marked as ${isCompleted ? 'completed' : 'incomplete'} via checkbox`
                }
              ]
            } as Task));
          }}
          className="relative w-4 h-4 rounded-full border border-black text-green-500 focus:ring-green-500 checked:bg-green-500 checked:border-transparent appearance-none before:content-['✓'] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-white before:opacity-0 checked:before:opacity-100 before:text-xs"
        />
        </div>
        <div className="flex items-center">
          <span className={`text-sm font-normal text-gray-900 ${task.status === 'Completed' ? 'line-through' : ''}`}>{task.title}</span>
        </div>
        <div className="hidden md:block"> {/* Hide due date in mobile view */}
          <span className="text-sm text-gray-500">
            {task.dueDate === new Date().toISOString().split('T')[0] 
              ? "Today"
              : new Date(task.dueDate).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }).split(',')[0].split(' ').reverse().join(' ') + ', ' + new Date(task.dueDate).getFullYear()
            }
          </span>
        </div>
        <div className="hidden md:block"> {/* Hide status select in mobile view */}
          <select
            value={task.status}
            onChange={handleStatusChange}
            className="text-xs border rounded px-2 py-0.5 bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200"
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="hidden md:inline-block px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-600">
            {task.category}
          </span>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-32 sm:w-40 md:w-48 bg-white rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setShowMenu(false);
                  }}
                  className="block px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(true);
                    setShowMenu(false);
                  }}
                  className="block px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  Delete
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
      {isEditModalOpen && <EditTaskModal task={task} onClose={() => setIsEditModalOpen(false)} />}
      {showConfirmDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={() => {
            handleDelete();
            setShowConfirmDialog(false);
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};


export default function TaskView() {
  const { searchQuery, categoryFilter, dueDateFilter } = useOutletContext<{
    searchQuery: string;
    categoryFilter: string;
    dueDateFilter: string;
  }>();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const dispatch = useDispatch<AppDispatch>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    todo: true,
    inProgress: true,
    completed: true
  });

  const [visibleTasks, setVisibleTasks] = useState({
    todo: 5,
    inProgress: 5,
    completed: 5
  });

  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const toggleSection = (section: 'todo' | 'inProgress' | 'completed') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadMore = (section: 'todo' | 'inProgress' | 'completed') => {
    setVisibleTasks(prev => ({
      ...prev,
      [section]: prev[section] + 5
    }));
  };


  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || task.category === categoryFilter;
    const matchesDueDate = !dueDateFilter || task.dueDate === dueDateFilter;
    return matchesSearch && matchesCategory && matchesDueDate;
  }).sort((a, b) => {
    // First sort by status-specific order
    if (a.status === b.status) {
      if (!sortOrder) return a.order - b.order;
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return a.order - b.order; //Added this line to handle the case when status is different.
  });

  const todoTasks = filteredTasks.filter(task => task.status === "Todo");
  const inProgressTasks = filteredTasks.filter(task => task.status === "In Progress");
  const completedTasks = filteredTasks.filter(task => task.status === "Completed");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, section: 'Todo' | 'In Progress' | 'Completed') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const taskIndex = parseInt(e.dataTransfer.getData("taskIndex"), 10);
    const originalSection = e.dataTransfer.getData("section");
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    try {
      const tasksInNewStatus = tasks.filter(t => t.status === section);
      const maxOrder = tasksInNewStatus.length > 0 
        ? Math.max(...tasksInNewStatus.map(t => t.order || 0))
        : -1;
      const updatedTask: Task = {
        ...task,
        status: section,
        completed: section === "Completed",
        order: maxOrder + 1,
        category: task.category,
        dueDate: task.dueDate,
        activity: [
          ...(task.activity || []),
          {
            timestamp: new Date().toISOString(),
            action: "status_change",
            details: `Task status changed to ${section} via drag and drop`
          }
        ]
      };

        //Reorder tasks in the original section
        if(originalSection !== section){
          const originalTasks = tasks.filter(t => t.status === originalSection);
          const newOriginalTasks = [...originalTasks];
          newOriginalTasks.splice(taskIndex, 1);
          newOriginalTasks.forEach((t, index) => {
            dispatch(updateTask({...t, order: index}));
          })
        }

      // Assuming modifyTask is now correctly imported and defined.
      await dispatch(modifyTask(updatedTask)); 
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleBulkStatusChange = async (newStatus: Task['status']) => {
    const selectedTasks = tasks.filter(task => task.selected);

    try {
      await Promise.all(selectedTasks.map(task => {
        const updatedTask = {
          ...task,
          status: newStatus,
          completed: newStatus === "Completed",
          selected: false
        };
        // Assuming modifyTask is now correctly imported and defined.
        return dispatch(modifyTask(updatedTask)); 
      }));
    } catch (error) {
      console.error("Failed to update tasks status:", error);
    }
  };

  const handleDeleteSelected = () => {
    const selectedTasks = tasks.filter(task => task.selected);
    if (selectedTasks.length > 0) {
      setShowBulkDeleteDialog(true);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const taskIds = tasks
        .filter((task) => task.selected)
        .map((task) => task.id);

      if (taskIds.length > 0) {
        await dispatch(deleteBulkTasks(taskIds)).unwrap();
        toast.success("Selected tasks deleted successfully");
      }
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md max-w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📋 Task List</h2>
        </div>

        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 p-3 bg-gray-100 rounded-t-lg font-medium text-gray-600 border-b">
          <div className="w-12"></div>
          <div>Task name</div>
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1 hover:text-purple-600 transition-colors"
            >
              Due on {sortOrder && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>} 
              <span className="text-gray-400">⌄</span>
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortOrder('asc');
                    setShowSortDropdown(false);
                  }}
                >
                  Sort Ascending
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortOrder('desc');
                    setShowSortDropdown(false);
                  }}
                >
                  Sort Descending
                </button>
                {sortOrder && (
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                    onClick={() => {
                      setSortOrder(null);
                      setShowSortDropdown(false);
                    }}
                  >
                    Clear Sorting
                  </button>
                )}
              </div>
            )}
          </div>
          <div>Task Status</div>
          <div>Task Category</div>
        </div>
        {tasks.some(task => task.selected) && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-4 z-50">
            <span className="text-sm">
              {tasks.filter(task => task.selected).length} Tasks Selected
            </span>
            <span className="text-gray-400">|</span>
            <div className="relative group">
              <button className="text-sm hover:text-gray-300">
                Status ▾
              </button>
              <div className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="py-1">
                  <button onClick={() => handleBulkStatusChange('Todo')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">Todo</button>
                  <button onClick={() => handleBulkStatusChange('In Progress')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">In Progress</button>
                  <button onClick={() => handleBulkStatusChange('Completed')} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700">Completed</button>
                </div>
              </div>
            </div>
            <button 
              onClick={handleDeleteSelected}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        )}
        {filteredTasks.length === 0 && searchQuery ? (
          <NoResultsFound />
        ) : (
          <div className="flex flex-col gap-4">
            {(!searchQuery || todoTasks.length > 0) && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <button 
                onClick={() => toggleSection('todo')}
                className="w-full bg-purple-200 p-3 font-medium text-left flex justify-between items-center"
              >
                <span>Todo ({todoTasks.length})</span>
                <span className="transform transition-transform duration-200" style={{ transform: expandedSections.todo ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>
              {expandedSections.todo && (
                <div 
                  className="p-4 min-h-[100px] transition-all duration-200"
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, "Todo")}
                >
                  <QuickAddTask /> {/* Add QuickAddTask component here */}
                  {todoTasks.length > 0 ? (
                    <>
                      {todoTasks.slice(0, visibleTasks.todo).map((task, index) => 
                        <TaskCard key={task.id} task={task} index={index} section={"Todo"}/>
                      )}
                      {todoTasks.length > visibleTasks.todo && (
                        <button 
                          onClick={() => loadMore('todo')}
                          className="mt-4 w-full py-2 px-4 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                        >
                          Load More ({todoTasks.length - visibleTasks.todo} remaining)
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-600">No Todo Tasks</div>
                  )}
                </div>
              )}
            </div>
          )}

          {(!searchQuery || inProgressTasks.length > 0) && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <button 
                onClick={() => toggleSection('inProgress')}
                className="w-full bg-blue-200 p-3 font-medium text-left flex justify-between items-center"
              >
                <span>In-Progress ({inProgressTasks.length})</span>
                <span className="transform transition-transform duration-200" style={{ transform: expandedSections.inProgress ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>
              {expandedSections.inProgress && (
                <div 
                  className="p-4 min-h-[100px] transition-all duration-200"
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, "In Progress")}
                >
                  {inProgressTasks.length > 0 ? (
                    <>
                      {inProgressTasks.slice(0, visibleTasks.inProgress).map((task, index) => 
                        <TaskCard key={task.id} task={task} index={index} section={"In Progress"}/>
                      )}
                      {inProgressTasks.length > visibleTasks.inProgress && (
                        <button 
                          onClick={() => loadMore('inProgress')}
                          className="mt-4 w-full py-2 px-4 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Load More ({inProgressTasks.length - visibleTasks.inProgress} remaining)
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-600">No Tasks In Progress</div>
                  )}
                </div>
              )}
            </div>
          )}

          {(!searchQuery || completedTasks.length > 0) && (
            <div className="border rounded-lg overflow-hidden mb-4">
              <button 
                onClick={() => toggleSection('completed')}
                className="w-full bg-green-200 p-3 font-medium text-left flex justify-between items-center"
              >
                <span>Completed ({completedTasks.length})</span>
                <span className="transform transition-transform duration-200" style={{ transform: expandedSections.completed ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
              </button>
              {expandedSections.completed && (
                <div 
                  className="p-4 min-h-[100px] transition-all duration-200"
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, "Completed")}
                >
                  {completedTasks.length > 0 ? (
                    <>
                      {completedTasks.slice(0, visibleTasks.completed).map((task, index) => 
                        <TaskCard key={task.id} task={task} index={index} section={"Completed"}/>
                      )}
                      {completedTasks.length > visibleTasks.completed && (
                        <button 
                          onClick={() => loadMore('completed')}
                          className="mt-4 w-full py-2 px-4 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Load More ({completedTasks.length - visibleTasks.completed} remaining)
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-600">No Completed Tasks</div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        )}
      </div>
      {showBulkDeleteDialog && (
        <ConfirmDialog
          isOpen={showBulkDeleteDialog}
          title="Delete Multiple Tasks"
          message="Are you sure you want to delete the selected tasks? This action cannot be undone."
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteDialog(false)}
        />
      )}
    </div>
  );
}