
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Problem, getProblemById, addComment, updateProblemStatus, ProblemStatus } from "@/services/problemService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, User, MessageSquare, ArrowLeft, Send, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const statusColors: Record<ProblemStatus, string> = {
    pending: "status-pending",
    watched: "status-watched",
    observed: "status-observed",
    success: "status-success"
  };
  
  const statusLabels: Record<ProblemStatus, string> = {
    pending: "Pending",
    watched: "Watched",
    observed: "Under Observation",
    success: "Resolved"
  };

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      
      try {
        const data = await getProblemById(id);
        if (data) {
          setProblem(data);
        } else {
          toast({
            variant: "destructive",
            title: "Not found",
            description: "Problem not found"
          });
          navigate("/");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load problem details"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProblem();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: ProblemStatus) => {
    if (!problem || !user || user.role !== 'agent') return;
    
    setSubmitting(true);
    try {
      const updated = await updateProblemStatus(problem.id, newStatus, user);
      setProblem(updated);
      toast({
        title: "Status updated",
        description: `Problem status changed to ${statusLabels[newStatus]}`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!problem || !user || !comment.trim()) return;
    
    setSubmitting(true);
    try {
      await addComment(problem.id, comment, user);
      // Refresh problem data
      const updated = await getProblemById(problem.id);
      if (updated) {
        setProblem(updated);
        setComment("");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Comment failed",
        description: "Failed to add comment"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
        <p className="text-muted-foreground mb-4">The problem you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{problem.title}</CardTitle>
            <div className={`status-badge ${statusColors[problem.status]}`}>
              {problem.status === 'observed' && <Eye className="h-3 w-3 mr-1" />}
              {problem.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {statusLabels[problem.status]}
            </div>
          </div>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{problem.userName}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{problem.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{format(new Date(problem.createdAt), "PPP")}</span>
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="whitespace-pre-line">{problem.description}</p>
          
          {problem.media.length > 0 && (
            <div className="space-y-2">
              <div className="relative rounded-md overflow-hidden">
                {problem.media[activeImageIndex].type === 'image' ? (
                  <img
                    src={problem.media[activeImageIndex].url}
                    alt={`Media for ${problem.title}`}
                    className="w-full h-auto max-h-[500px] object-contain bg-gray-100"
                  />
                ) : (
                  <video
                    src={problem.media[activeImageIndex].url}
                    controls
                    className="w-full h-auto max-h-[500px]"
                  />
                )}
              </div>
              
              {problem.media.length > 1 && (
                <div className="flex gap-2 overflow-auto pb-2">
                  {problem.media.map((item, index) => (
                    <button
                      key={item.id}
                      className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                        index === activeImageIndex ? 'border-municipal-500' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={`Thumbnail ${index}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {user && user.role === 'agent' && (
            <div className="p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Update Status</h3>
              <div className="flex gap-2">
                <Select
                  defaultValue={problem.status}
                  onValueChange={value => handleStatusChange(value as ProblemStatus)}
                  disabled={submitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="watched">Watched</SelectItem>
                    <SelectItem value="observed">Under Observation</SelectItem>
                    <SelectItem value="success">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Comments ({problem.comments.length})
            </h3>
            
            <div className="space-y-4">
              {problem.comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                problem.comments.map(comment => (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{comment.userName}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          {user ? (
            <form onSubmit={handleAddComment} className="w-full">
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                  disabled={submitting}
                  required
                />
                <Button 
                  type="submit" 
                  disabled={submitting || !comment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          ) : (
            <div className="w-full text-center py-2">
              <p className="text-sm text-muted-foreground">
                <Button variant="link" onClick={() => navigate("/login")}>Sign in</Button> to leave a comment
              </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProblemDetail;
