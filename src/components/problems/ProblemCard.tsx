
import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, MessageSquare, Eye, CheckCircle2 } from "lucide-react";
import { Problem, ProblemStatus } from "@/services/problemService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface ProblemCardProps {
  problem: Problem;
}

const ProblemCard = ({ problem }: ProblemCardProps) => {
  const [imageError, setImageError] = useState(false);
  
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
  
  const statusIcons: Record<ProblemStatus, React.ReactNode> = {
    pending: null,
    watched: <Eye className="h-3 w-3 mr-1" />,
    observed: <Eye className="h-3 w-3 mr-1" />,
    success: <CheckCircle2 className="h-3 w-3 mr-1" />
  };
  
  return (
    <Card className="problem-card overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Link 
              to={`/problems/${problem.id}`}
              className="font-semibold text-lg hover:text-municipal-600 transition-colors"
            >
              {problem.title}
            </Link>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{problem.location}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`status-badge ${statusColors[problem.status]}`}>
              <div className="flex items-center">
                {statusIcons[problem.status]}
                {statusLabels[problem.status]}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {problem.description}
        </p>
        
        {problem.media.length > 0 && !imageError && problem.media[0].type === 'image' && (
          <div className="relative h-40 w-full rounded-md overflow-hidden mb-2">
            <img
              src={problem.media[0].url}
              alt={problem.title}
              className="object-cover h-full w-full"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Posted by {problem.userName} • {format(new Date(problem.createdAt), "MMM d, yyyy")}
        </div>
        
        <Link to={`/problems/${problem.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            {problem.comments.length > 0 ? problem.comments.length : "Comment"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProblemCard;
