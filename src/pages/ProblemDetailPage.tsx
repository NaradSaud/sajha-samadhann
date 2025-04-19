
import Navbar from "@/components/Navbar";
import ProblemDetail from "@/components/problems/ProblemDetail";

const ProblemDetailPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ProblemDetail />
      </main>
    </div>
  );
};

export default ProblemDetailPage;
