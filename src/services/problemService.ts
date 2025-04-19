
import { User } from "@/context/AuthContext";

export type ProblemStatus = 'pending' | 'watched' | 'observed' | 'success';

export interface Problem {
  id: string;
  title: string;
  description: string;
  location: string;
  status: ProblemStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  media: Media[];
  comments: Comment[];
}

export interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Sample data
const sampleProblems: Problem[] = [
  {
    id: '1',
    title: 'Broken Street Light',
    description: 'The street light at the corner of Main St and Park Ave has been broken for two weeks.',
    location: 'Main St & Park Ave, Bhimdatta',
    status: 'pending',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: '1',
    userName: 'John Doe',
    media: [
      {
        id: '101',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
      }
    ],
    comments: []
  },
  {
    id: '2',
    title: 'Garbage Collection Issue',
    description: 'Garbage has not been collected from Residential Area 3 for the past week.',
    location: 'Residential Area 3, Bhimdatta',
    status: 'watched',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: '1',
    userName: 'John Doe',
    media: [
      {
        id: '102',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1621792907526-eb05770eeb62'
      }
    ],
    comments: [
      {
        id: '201',
        text: 'We have noted this issue and dispatched a team.',
        userId: '2',
        userName: 'Agent Smith',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: '3',
    title: 'Pothole on Highway',
    description: 'There is a large pothole on the highway near the city entrance that is causing traffic and vehicle damage.',
    location: 'Highway Entrance, Bhimdatta',
    status: 'observed',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: '1',
    userName: 'John Doe',
    media: [
      {
        id: '103',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7'
      },
      {
        id: '104',
        type: 'video',
        url: 'https://example.com/video1.mp4'
      }
    ],
    comments: [
      {
        id: '202',
        text: 'This has been reported to the Highway Department.',
        userId: '2',
        userName: 'Agent Smith',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '203',
        text: 'Repair team has been scheduled for next week.',
        userId: '2',
        userName: 'Agent Smith',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Get all problems
export const getProblems = async (): Promise<Problem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...sampleProblems].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

// Get a specific problem
export const getProblemById = async (id: string): Promise<Problem | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return sampleProblems.find(problem => problem.id === id);
};

// Create a new problem
export const createProblem = async (
  problem: Omit<Problem, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'comments'>
): Promise<Problem> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newProblem: Problem = {
    ...problem,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: []
  };
  
  sampleProblems.push(newProblem);
  return newProblem;
};

// Update problem status (for municipality agents)
export const updateProblemStatus = async (
  id: string,
  status: ProblemStatus,
  user: User
): Promise<Problem> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (user.role !== 'agent') {
    throw new Error('Only municipality agents can update problem status');
  }
  
  const problemIndex = sampleProblems.findIndex(p => p.id === id);
  if (problemIndex === -1) {
    throw new Error('Problem not found');
  }
  
  const updatedProblem = {
    ...sampleProblems[problemIndex],
    status,
    updatedAt: new Date().toISOString()
  };
  
  sampleProblems[problemIndex] = updatedProblem;
  return updatedProblem;
};

// Add a comment to a problem
export const addComment = async (
  problemId: string,
  text: string,
  user: User
): Promise<Comment> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const problemIndex = sampleProblems.findIndex(p => p.id === problemId);
  if (problemIndex === -1) {
    throw new Error('Problem not found');
  }
  
  const comment: Comment = {
    id: Date.now().toString(),
    text,
    userId: user.id,
    userName: user.name,
    createdAt: new Date().toISOString()
  };
  
  sampleProblems[problemIndex].comments.push(comment);
  sampleProblems[problemIndex].updatedAt = new Date().toISOString();
  
  return comment;
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
