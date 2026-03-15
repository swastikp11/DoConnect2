export interface User {
  userId: number;
  username: string;
  role: string;
  token: string;
}

export interface Question {
  questionId: number;
  title: string;
  body: string;
  topic: string;
  status: string;
  createdAt: string;
  authorUsername: string;
  answerCount: number;
  imagePaths: string[];
}

export interface Answer {
  answerId: number;
  body: string;
  status: string;
  createdAt: string;
  authorUsername: string;
  questionId: number;
  imagePaths: string[];

  
}