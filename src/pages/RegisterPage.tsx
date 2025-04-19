
import Navbar from "@/components/Navbar";
import RegisterForm from "@/components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;
