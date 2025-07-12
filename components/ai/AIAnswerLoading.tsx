'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bot } from 'lucide-react';

interface AIAnswerLoadingProps {
  question: string;
}

export default function AIAnswerLoading({ question }: AIAnswerLoadingProps) {
  return (
    <Card className="mb-6 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg">AI Answer</CardTitle>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          "{question}"
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-muted-foreground">
            Generating answer...
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 