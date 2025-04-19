
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getProblems, Problem, ProblemStatus } from "@/services/problemService";
import ProblemCard from "@/components/problems/ProblemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

const AgentDashboardPage = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProblemStatus | 'all'>('all');
  
  // Redirect if not authenticated or not an agent
  if (!user || user.role !== 'agent') {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    const loadProblems = async () => {
      try {
        const data = await getProblems();
        setProblems(data);
      } catch (error) {
        console.error("Error loading problems:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProblems();
  }, []);
  
  const filteredProblems = problems.filter(problem => 
    filter === 'all' || problem.status === filter
  );
  
  // Calculate statistics
  const problemStats = {
    total: problems.length,
    pending: problems.filter(p => p.status === 'pending').length,
    watched: problems.filter(p => p.status === 'watched').length,
    observed: problems.filter(p => p.status === 'observed').length,
    resolved: problems.filter(p => p.status === 'success').length,
  };
  
  const chartData = [
    { name: 'Pending', value: problemStats.pending, color: '#eab308' },
    { name: 'Watched', value: problemStats.watched, color: '#3b82f6' },
    { name: 'Under Observation', value: problemStats.observed, color: '#a855f7' },
    { name: 'Resolved', value: problemStats.resolved, color: '#22c55e' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Municipality Agent Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Problem Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} problems`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-municipal-50 rounded-lg p-4">
                  <p className="text-sm text-municipal-600 mb-1">Total Problems</p>
                  <p className="text-3xl font-bold">{problemStats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold">{problemStats.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Watched</p>
                  <p className="text-3xl font-bold">{problemStats.watched}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold">{problemStats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Manage Problems</h2>
        <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as ProblemStatus | 'all')}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="watched">Watched</TabsTrigger>
            <TabsTrigger value="observed">Observed</TabsTrigger>
            <TabsTrigger value="success">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="loader">Loading problems...</div>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-md">
                <h3 className="text-lg font-medium">No problems found</h3>
                <p className="text-muted-foreground mt-2">
                  There are no {filter !== 'all' ? filter : ''} problems to display.
                </p>
                {filter !== 'all' && (
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setFilter('all')}
                  >
                    View All Problems
                  </Button>
                )}
              </div>
            ) : (
              filteredProblems.map(problem => (
                <ProblemCard key={problem.id} problem={problem} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AgentDashboardPage;
