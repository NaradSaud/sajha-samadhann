
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getProblemById, updateProblemStatus, Problem, ProblemStatus } from "@/services/problemService";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, MapPin, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  watched: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  observed: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  success: "bg-green-100 text-green-800 hover:bg-green-200",
};

const statusLabels: Record<ProblemStatus, string> = {
  pending: "Pending",
  watched: "Watched",
  observed: "Under Observation",
  success: "Resolved",
};

const ProblemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "updates">("details");
  const { user } = useAuth();
  const isAgent = user?.role === "agent";

  useEffect(() => {
    const loadProblem = async () => {
      try {
        if (id) {
          const data = await getProblemById(id);
          setProblem(data || null);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load problem details",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id]);

  const handleStatusChange = async (newStatus: ProblemStatus) => {
    try {
      if (!problem || !user) return;
      
      setUpdating(true);
      
      const updatedProblem = await updateProblemStatus(
        problem.id,
        newStatus,
        user
      );
      
      setProblem(updatedProblem);
      
      toast({
        title: "Status updated",
        description: `Problem status updated to ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update problem status",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Problem Not Found</h2>
        <p className="text-muted-foreground">
          The problem you're looking for doesn't exist or has been removed
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{problem.title}</h1>
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {format(new Date(problem.createdAt), "MMMM d, yyyy")}
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            {problem.userName}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {problem.location}
          </div>
          <div>
            <Badge
              variant="outline"
              className={statusColors[problem.status]}
            >
              {statusLabels[problem.status]}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "details" | "updates")}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Problem description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{problem.description}</p>
            </CardContent>
          </Card>

          {/* Media gallery */}
          {problem.media && problem.media.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photos & Videos</CardTitle>
                <CardDescription>
                  Visual evidence of the reported problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {problem.media.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-md overflow-hidden h-48"
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt="Problem evidence"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map/Location details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
              <CardDescription>
                Where this problem was reported
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-md p-6 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">{problem.location}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Precise map location is not available in this demo version.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agent-only action card */}
          {isAgent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Municipal Actions</CardTitle>
                <CardDescription>
                  Update the status of this problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    Current status: 
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${statusColors[problem.status]}`}
                    >
                      {statusLabels[problem.status]}
                    </Badge>
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                          disabled={problem.status === "watched" || updating}
                        >
                          Mark as Watched
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Update to Watched</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the problem as watched, indicating it has been reviewed by the municipality.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusChange("watched")}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
                          disabled={problem.status === "observed" || updating}
                        >
                          Under Observation
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark Under Observation</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the problem as under observation, indicating active monitoring by the municipality.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusChange("observed")}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                          disabled={problem.status === "success" || updating}
                        >
                          Mark as Resolved
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark as Resolved</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the problem as resolved. This action indicates that the municipality has addressed and fixed the reported issue.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusChange("success")}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {problem.status !== "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                            disabled={updating}
                          >
                            Reset to Pending
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset to Pending</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset the problem status back to pending. Are you sure?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleStatusChange("pending")}>
                              Reset
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status History</CardTitle>
              <CardDescription>
                Timeline of updates for this problem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {problem.comments && problem.comments.length > 0 ? (
                <div className="space-y-4">
                  {problem.comments.map((comment, index) => (
                    <div key={comment.id}>
                      <div className="flex gap-2 items-start">
                        <div className="w-2 h-2 rounded-full mt-2 bg-blue-100" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">
                              Comment
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                            </p>
                          </div>
                          <p className="text-sm mt-1">{comment.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            By {comment.userName}
                          </p>
                        </div>
                      </div>
                      {index < problem.comments.length - 1 && (
                        <div className="pl-1 ml-1 mt-2 mb-2 border-l-2 border-dashed border-muted h-4" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No updates have been recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemDetail;
