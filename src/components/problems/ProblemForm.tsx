
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { createProblem, fileToBase64, Media } from "@/services/problemService";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Camera, ImagePlus, Video } from "lucide-react";

const ProblemForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation."
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // For demo purposes, just set the coords as location
        // In a real app, this would use a reverse geocoding service
        setLocation(`Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`);
        setIsGettingLocation(false);
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location error",
          description: error.message
        });
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      const newMedia: Media = {
        id: Date.now().toString(),
        type,
        url: base64
      };
      
      setMedia([...media, newMedia]);
      
      toast({
        title: "File uploaded",
        description: `${type === 'image' ? 'Image' : 'Video'} has been added`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload file"
      });
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "You must be logged in to report a problem"
      });
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
                placeholder="Enter the location of the problem"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isGettingLocation ? "Getting..." : "Current Location"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Media (Optional)</Label>
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
                    id="media-upload"
                    onChange={handleMediaUpload}
                    accept="image/*,video/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="h-8 w-8 mb-1" />
                    <span className="text-xs">Upload Photo/Video</span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              You can upload up to 3 photos or videos (max 5MB each)
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Report Problem"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProblemForm;
