
import Navbar from "@/components/Navbar";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h1>
        <ResetPasswordForm />
      </main>
    </div>
  );
};

export default ResetPasswordPage;
