import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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
}

interface QuestionCardProps {
  question: Question;
  showFullContent?: boolean;
}

export default function QuestionCard({ question, showFullContent = false }: QuestionCardProps) {
  // Extract text content from the rich text description
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

  const textContent = getTextContent(question.description);
  const timeAgo = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <Link href={`/questions/${question.id}`} className="block">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
            {question.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          {showFullContent ? (
            <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
              {textContent}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {textContent}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {question.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs px-2 py-1"
            >
              {tag.name}
            </Badge>
          ))}
          {question.tags.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-1"
            >
              +{question.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {question.author.avatarUrl ? (
                <img
                  src={question.author.avatarUrl}
                  alt={question.author.username}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="font-medium">{question.author.username}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}</span>
            </div>
            
            <span className="text-xs">{timeAgo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 