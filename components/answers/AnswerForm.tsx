'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface AnswerFormProps {
  questionId: string;
  onAnswerSubmitted?: () => void;
  onCancel?: () => void;
}

export default function AnswerForm({ questionId, onAnswerSubmitted, onCancel }: AnswerFormProps) {
  const [content, setContent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content) {
      alert('Please write your answer');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          content
        }),
      });

      if (response.ok) {
        setContent(null);
        onAnswerSubmitted?.();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit answer'}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your answer here..."
            className="min-h-[200px]"
          />
          
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || !content}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 