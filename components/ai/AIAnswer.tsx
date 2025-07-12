'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Bot, Copy, Check, X } from 'lucide-react';

interface AIAnswerProps {
  question: string;
  answer: string;
  confidence: number;
  onClose?: () => void;
}

export default function AIAnswer({ question, answer, confidence, onClose }: AIAnswerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (conf >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-lg">
      <CardHeader className="pb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <CardTitle className="text-lg">AI Answer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={getConfidenceColor(confidence)}
            >
              {Math.round(confidence * 100)}% confidence
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              aria-label="Copy AI answer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Close AI answer"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-medium break-words">
          "{question}"
        </p>
      </CardHeader>
      <CardContent>
        <div className="prose prose-base max-w-none dark:prose-invert text-foreground leading-relaxed whitespace-pre-wrap break-words">
          {/* Render HTML answer safely */}
          <div dangerouslySetInnerHTML={{ __html: answer }} />
        </div>
      </CardContent>
    </Card>
  );
} 