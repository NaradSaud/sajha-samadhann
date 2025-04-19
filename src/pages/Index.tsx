
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ProblemFeed from "@/components/feed/ProblemFeed";
import { Camera, MapPin, CheckCircle2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {!user && (
          <div className="bg-municipal-600 text-white rounded-lg mb-8 p-6 md:p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Connect and Solve: Bhimdatta Municipality
              </h1>
              <p className="text-lg mb-6">
                Report community issues, track their resolution, and make our city better together
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" variant="secondary">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-municipal-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white shadow-sm border rounded-lg text-center">
              <div className="inline-block p-3 bg-municipal-100 text-municipal-600 rounded-full mb-4">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Report Problems</h3>
              <p className="text-muted-foreground">
                Document issues with photos, videos and descriptions
              </p>
            </div>
            
            <div className="p-6 bg-white shadow-sm border rounded-lg text-center">
              <div className="inline-block p-3 bg-municipal-100 text-municipal-600 rounded-full mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Pin Locations</h3>
              <p className="text-muted-foreground">
                Easily mark exact problem locations for faster resolution
              </p>
            </div>
            
            <div className="p-6 bg-white shadow-sm border rounded-lg text-center">
              <div className="inline-block p-3 bg-municipal-100 text-municipal-600 rounded-full mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-lg mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Follow issues from reporting to resolution
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Community Feed</h2>
          {user && (
            <Link to="/create">
              <Button>
                Report Problem
              </Button>
            </Link>
          )}
        </div>
        
        <ProblemFeed />
      </main>
      
      <footer className="mt-auto bg-white border-t py-6">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bhimdatta Connect - Report and resolve community issues together
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
