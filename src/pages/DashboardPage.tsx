import { useAuth } from "@/contexts/AuthContext";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

const DashboardPage = () => {
  const { role } = useAuth();

  if (role === "employer") return <EmployerDashboard />;
  if (role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
};

export default DashboardPage;
