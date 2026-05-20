import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AnalysisPage from "./pages/AnalysisPage";
import DashboardPage from "./pages/DashboardPage";
import InterviewPracticePage from "./pages/InterviewPracticePage";
import JobMatchPage from "./pages/JobMatchPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResultsPage from "./pages/ResultsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/analysis/:resumeId" element={<AnalysisPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:resumeId" element={<ResultsPage />} />
          <Route path="/interview-practice" element={<InterviewPracticePage />} />
          <Route path="/interview-practice/:resumeId" element={<InterviewPracticePage />} />
          <Route path="/job-match" element={<JobMatchPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
