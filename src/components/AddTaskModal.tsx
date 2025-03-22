import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask } from "../redux/taskSlice";
import { RootState, AppDispatch } from "../redux/store";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/storageConfig";

interface AddTaskModalProps {
  onClose: () => void;
}


export default function AddTaskModal({ onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // Added loading state
  const user = useSelector((state: RootState) => state.user.user);
  const modalRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const quill = new (window as any).Quill('#quill-editor', {
      theme: 'snow',
      placeholder: 'Enter description...',
      modules: {
        toolbar: '#toolbar-container'
      }
    });

    quill.on('text-change', () => {
      setDescription(quill.root.innerHTML);
    });

    return () => {
      quill.off('text-change');
    };
  }, []);

  const uploadImage = async (file: File, userId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `taskImages/${userId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      setIsUploading(true); // Set loading state to true

      if (user) {
        try {
          const imageUrl = await uploadImage(file, user.uid);
          setFileUrl(imageUrl);
          setIsUploading(false); // Set loading state to false after upload
        } catch (error) {
          console.error("Error uploading image:", error);
          setIsUploading(false); // Set loading state to false on error
        }
      }
    }
  };

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      console.error("No user found");
      return;
    }

    try {
      const newTask = {
        userId: user.uid,
        title,
        description,
        category: category as "Work" | "Personal",
        dueDate,
        status: status as "Todo" | "In Progress" | "Completed",
        fileUrl: fileUrl,
        completed: status === "Completed",
        selected: false,
        order: Date.now() // Using timestamp as order
      };

      await dispatch(createTask(newTask));
      console.log("Task created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      // Here you might want to show an error message to the user
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg p-4">
      <div ref={modalRef} className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-[95%] sm:max-w-[80%] md:max-w-[60%] lg:max-w-[40%] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create Task</h2>

        <form onSubmit={handleSubmit}>
          {/* Task Title */}
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />

          {/* Description */}
          <div className="mb-3">
            <div id="toolbar-container">
              <span className="ql-formats">
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                <button className="ql-underline"></button>
              </span>
              <span className="ql-formats">
                <button className="ql-list" value="ordered"></button>
                <button className="ql-list" value="bullet"></button>
              </span>
              <span className="ql-formats">
                <button className="ql-clean"></button>
              </span>
            </div>
            <div id="quill-editor" style={{height: "200px"}} className="mb-3"></div>
          </div>

          {/* Filters Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
  {/* Task Category */}
  <div>
    <label className="text-sm text-gray-600 mb-1 block">Task Category*</label>
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        className={`px-3 py-1 rounded ${
          category === "Work" ? "bg-purple-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => setCategory("Work")}
      >
        Work
      </button>
      <button
        type="button"
        className={`px-3 py-1 rounded ${
          category === "Personal" ? "bg-purple-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => setCategory("Personal")}
      >
        Personal
      </button>
    </div>
  </div>

  {/* Due Date */}
  <div>
    <label className="text-sm text-gray-600 mb-1 block">Due Date*</label>
    <div className="relative">
      <input
        type="date"
        value={dueDate}
        onChange={(e) => {
          const selectedDate = new Date(e.target.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            alert("Please select a future date");
            setDueDate(today.toISOString().split('T')[0]);
          } else {
            setDueDate(e.target.value);
          }
        }}
        min={new Date().toISOString().split('T')[0]}
        placeholder="Select Due Date"
        className="w-full p-2 pl-8 border rounded appearance-none"
        required
      />
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
        📅
      </span>
    </div>
  </div>

  {/* Task Status */}
  <div>
    <label className="text-sm text-gray-600 mb-1 block">Task Status*</label>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="w-full p-2 border rounded"
      required
    >
      <option value="">Select Status</option>
      <option value="Todo">To-Do</option>
      <option value="In Progress">In Progress</option>
      <option value="Completed">Completed</option>
    </select>
  </div>
</div>

          {/* File Upload */}
          <div className="mb-3 border p-3 rounded">
            <label className="block text-gray-600 mb-2">Attach Screenshot</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {file && <p className="text-sm text-gray-500 mt-1">📎 {file.name}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`${
                isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              } text-white px-4 py-2 rounded`}
            >
              {isUploading ? 'Uploading...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}