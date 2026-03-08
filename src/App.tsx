import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import JobsPage from "@/pages/JobsPage";
import JobDetailPage from "@/pages/JobDetailPage";
import AboutPage from "@/pages/AboutPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import ResumeOptimizerPage from "@/pages/ai/ResumeOptimizerPage";
import CoverLetterPage from "@/pages/ai/CoverLetterPage";
import InterviewPracticePage from "@/pages/ai/InterviewPracticePage";
import SkillGapPage from "@/pages/ai/SkillGapPage";
import GitHubAnalyzerPage from "@/pages/ai/GitHubAnalyzerPage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:userId" element={<PublicProfilePage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/ai/resume" element={<ProtectedRoute><ResumeOptimizerPage /></ProtectedRoute>} />
                <Route path="/ai/cover-letter" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
                <Route path="/ai/interview" element={<ProtectedRoute><InterviewPracticePage /></ProtectedRoute>} />
                <Route path="/ai/skill-gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
                <Route path="/ai/github" element={<ProtectedRoute><GitHubAnalyzerPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
