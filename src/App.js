import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
