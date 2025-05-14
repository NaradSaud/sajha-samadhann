
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createProblem, fileToBase64, Media } from "@/services/problemService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera } from "lucide-react";

const ProblemForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Function to get the current location
  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`
      });
      return;
    }

    setIsGettingLocation(true);
    try {
      // Get location when photo is taken
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      
      // Process the image
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      const newMedia: Media = {
        id: Date.now().toString(),
        type,
        url: base64
      };
      
      setMedia([...media, newMedia]);
      
      toast({
        title: "Photo captured",
        description: "Location has been automatically captured"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Capture failed",
        description: error instanceof Error ? error.message : "Failed to capture photo or location"
      });
    } finally {
      setIsGettingLocation(false);
      
      // Reset the input value to allow capturing another photo with the same input
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure we have a user before proceeding
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to report a problem"
      });
      navigate("/login");
      return;
    }
    
    if (!title || !description || !location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    if (media.length === 0) {
      toast({
        variant: "destructive",
        title: "No photo",
        description: "Please take a photo of the problem"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createProblem({
        title,
        description,
        location,
        userId: user.id,
        userName: user.name,
        media
      });
      
      toast({
        title: "Problem reported",
        description: "Your problem has been successfully reported"
      });
      
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Failed to report the problem"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Report a Problem</CardTitle>
        <CardDescription>
          Fill out the form to report a problem in Bhimdatta Municipality
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief title of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the problem..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex gap-2">
              <Input
                id="location"
                placeholder="Location is captured automatically when taking a photo"
                value={location}
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                disabled={true}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Auto-captured
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Location is automatically captured when you take a photo
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {media.map((item, index) => (
                <div key={index} className="relative h-24 border rounded-md overflow-hidden">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Uploaded media ${index}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={item.url} 
                      className="w-full h-full object-cover" 
                      controls
                    />
                  )}
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full" 
                    onClick={() => handleRemoveMedia(index)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
              
              {media.length < 3 && (
                <div className="relative h-24 border border-dashed rounded-md flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="camera-capture"
                    ref={cameraInputRef}
                    onChange={handleCameraCapture}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={isSubmitting || isGettingLocation}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex flex-col items-center h-full w-full p-2" 
                    onClick={handleTakePhoto}
                    disabled={isSubmitting || isGettingLocation}
                  >
                    <Camera className="h-8 w-8 mb-1" />
                    <span className="text-xs">
                      {isGettingLocation ? "Processing..." : "Take Photo"}
                    </span>
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              You need to take a photo of the problem (max 3 photos)
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || media.length === 0}
          >
            {isSubmitting ? "Submitting..." : "Report Problem"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProblemForm;
