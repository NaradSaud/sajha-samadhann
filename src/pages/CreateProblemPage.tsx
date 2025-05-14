
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProblemForm from "@/components/problems/ProblemForm";
import { toast } from "@/components/ui/use-toast";

const CreateProblemPage = () => {
  const { user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!user) {
    // Show a toast to inform the user
    toast({
      title: "Authentication required",
      description: "Please log in to report a problem",
      variant: "destructive"
    });
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Report a Problem</h1>
        <ProblemForm />
      </main>
    </div>
  );
};

export default CreateProblemPage;
