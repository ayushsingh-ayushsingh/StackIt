'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle, User, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@clerk/nextjs';

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

interface AnswerCardProps {
  answer: Answer;
  questionAuthorId?: string;
  onVote?: (answerId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => void;
  onAcceptAnswer?: (answerId: string) => void;
  onRefresh?: () => void;
}

export default function AnswerCard({ 
  answer, 
  questionAuthorId, 
  onVote, 
  onAcceptAnswer,
  onRefresh 
}: AnswerCardProps) {
  const { user } = useUser();
  const [voting, setVoting] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // Extract text content from rich text
  const getTextContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (content?.content) {
      return content.content
        .map((node: any) => {
          if (node.type === 'paragraph' && node.content) {
            return node.content
              .map((textNode: any) => textNode.text || '')
              .join('');
          }
          return '';
        })
        .join(' ')
        .trim();
    }
    return '';
  };

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) {
      alert('Please log in to vote');
      return;
    }

    if (voting) return;

    try {
      setVoting(true);
      await onVote?.(answer.id, voteType);
    } finally {
      setVoting(false);
    }
  };

  const handleAcceptAnswer = async () => {
    if (!user) return;
    
    try {
      setAccepting(true);
      await onAcceptAnswer?.(answer.id);
    } finally {
      setAccepting(false);
    }
  };

  const canAcceptAnswer = user && questionAuthorId === user.id && !answer.isAccepted;
  const timeAgo = formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true });

  return (
    <Card className={`mb-4 ${answer.isAccepted ? 'border-green-500 bg-green-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {answer.author.avatarUrl ? (
              <img
                src={answer.author.avatarUrl}
                alt={answer.author.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
            <div>
              <div className="font-medium text-sm">{answer.author.username}</div>
              <div className="text-xs text-muted-foreground">{timeAgo}</div>
            </div>
          </div>
          
          {answer.isAccepted && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Answer Content */}
        <div className="prose prose-sm max-w-none">
          {getTextContent(answer.content)}
        </div>

        {/* Voting and Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            {/* Voting */}
            <div className="flex items-center gap-2">
              <Button
                variant={answer.userVote === 'UPVOTE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('UPVOTE')}
                disabled={voting}
                className="h-8 px-2"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                {answer.upvotes}
              </Button>
              
              <Button
                variant={answer.userVote === 'DOWNVOTE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('DOWNVOTE')}
                disabled={voting}
                className="h-8 px-2"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                {answer.downvotes}
              </Button>
            </div>

            {/* Comment button (placeholder for future feature) */}
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>
          </div>

          {/* Accept Answer Button */}
          {canAcceptAnswer && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptAnswer}
              disabled={accepting}
              className="h-8 border-green-500 text-green-600 hover:bg-green-50"
            >
              {accepting ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept Answer
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 