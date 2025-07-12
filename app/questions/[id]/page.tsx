'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SiteHeader from '@/components/custom/siteHeader';
import QuestionCard from '@/components/questions/QuestionCard';
import AnswerCard from '@/components/answers/AnswerCard';
import AnswerForm from '@/components/answers/AnswerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Loader2 } from 'lucide-react';

interface Question {
  id: string;
  title: string;
  description: any;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  answerCount: number;
  acceptedAnswerId?: string;
}

interface Answer {
  id: string;
  content: any;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  isAccepted?: boolean;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const { user } = useUser();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const questionId = params.id as string;

  useEffect(() => {
    if (questionId) {
      loadQuestion();
      loadAnswers();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setQuestion(data);
      }
    } catch (error) {
      console.error('Error loading question:', error);
    }
  };

  const loadAnswers = async () => {
    try {
      const response = await fetch(`/api/answers?questionId=${questionId}`);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error('Error loading answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmitted = () => {
    setShowAnswerForm(false);
    loadAnswers();
    loadQuestion(); // Refresh question to update answer count
  };

  const handleVote = async (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    try {
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers(prev => 
          prev.map(answer => 
            answer.id === answerId 
              ? { 
                  ...answer, 
                  upvotes: data.upvotes, 
                  downvotes: data.downvotes,
                  userVote: data.userVote
                }
              : answer
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        setAnswers(prev => 
          prev.map(answer => 
            answer.id === answerId 
              ? { ...answer, isAccepted: true }
              : { ...answer, isAccepted: false }
          )
        );
        loadQuestion(); // Refresh question to update accepted answer
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Question not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl p-4 pt-8">
        {/* Question */}
        <div className="mb-8">
          <QuestionCard question={question} showFullContent={true} />
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            {user && (
              <Button
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                {showAnswerForm ? 'Cancel' : 'Write Answer'}
              </Button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <AnswerForm
              questionId={questionId}
              onAnswerSubmitted={handleAnswerSubmitted}
              onCancel={() => setShowAnswerForm(false)}
            />
          )}

          {/* Answers List */}
          {answers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No answers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to answer this question!
                </p>
                {user && (
                  <Button onClick={() => setShowAnswerForm(true)}>
                    Write Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  questionAuthorId={question.author.id}
                  onVote={handleVote}
                  onAcceptAnswer={handleAcceptAnswer}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 