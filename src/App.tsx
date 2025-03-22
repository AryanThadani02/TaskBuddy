import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import TaskView from "./components/TaskList";
import BoardView from "./components/BoardView";

export default function App() {
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home/tasks" /> : <LoginPage />} />

      {/* Home Page with nested routes */}
      <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" />}>
        <Route path="tasks" element={<TaskView />} />
        <Route path="board" element={<BoardView />} />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
