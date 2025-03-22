
# TaskBuddy - React Task Management Application

A modern task management application built with React, TypeScript, and Firebase, featuring a responsive UI with Tailwind CSS.

## Features

- 📱 Responsive design that works on desktop and mobile
- 🔐 Google Authentication
- 📋 List and Board views for tasks
- 🔍 Advanced filtering and search capabilities
- 🎯 Task categorization
- 📅 Due date tracking
- 🔄 Real-time updates with Firebase

## Tech Stack

- **Frontend**: React + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Backend/Database**: Firebase (Authentication + Firestore)
- **Build Tool**: Vite

## Getting Started

1. Fork this Repl to get your own copy
2. Click the "Run" button to start the development server
3. Sign in with your Google account
4. Start managing your tasks!

## Project Structure

```
src/
├── components/          # React components
├── firebase/           # Firebase configuration
├── redux/              # Redux store and slices
├── types/              # TypeScript interfaces
└── App.tsx             # Main application component
```

## Features Breakdown

### Authentication
- Google Sign-in integration
- Persistent user sessions
- Protected routes

### Task Management
- Create, read, update, and delete tasks
- Set task categories (Work, Personal)
- Add due dates
- Mark tasks as complete

### Views
- List View: Traditional task list layout
- Board View: Kanban-style board (desktop only)
- Responsive design with mobile-first approach

### Filtering
- Search tasks by text
- Filter by category
- Filter by due date

## Development

The project uses Vite for fast development and building. Available scripts:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Firebase Setup

The application uses Firebase for authentication and data storage. Make sure to:

1. Enable Google Authentication in Firebase Console
2. Set up Firestore Database
3. Configure security rules for Firestore

## Contributing

1. Fork the project
2. Create a new branch for your feature
3. Make your changes
4. Test thoroughly
5. Submit a merge request

## License

This project is licensed under the MIT License.
