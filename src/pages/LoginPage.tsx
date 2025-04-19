
import Navbar from "@/components/Navbar";
import LoginForm from "@/components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        <LoginForm />
      </main>
    </div>
  );
};

export default LoginPage;
