'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, X, Bot, Sparkles } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface Tag {
  id: string;
  name: string;
}

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AskQuestionModal({ isOpen, onClose }: AskQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Load available tags when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (response.ok) {
        const tags = await response.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAskAI = async () => {
    if (!title.trim()) {
      alert('Please enter a question title first');
      return;
    }

    try {
      setAiLoading(true);
      setAiSuggestion('');

      const response = await fetch('/api/ai/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: title }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestion(data.answer);
      } else {
        setAiSuggestion('Sorry, I could not generate a suggestion at this time.');
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiSuggestion('Sorry, I encountered an error while generating a suggestion.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseAISuggestion = () => {
    if (aiSuggestion) {
      setDescription({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: aiSuggestion
              }
            ]
          }
        ]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const questionData = {
        title: title.trim(),
        description: description,
        tags: selectedTags
      };

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setSelectedTags([]);
        setAiSuggestion('');
        onClose();
        // The questions list will be refreshed automatically by the parent component
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to submit question'}`);
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setTitle('');
      setDescription(null);
      setSelectedTags([]);
      setAiSuggestion('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Ask a Question</DialogTitle>
          <DialogDescription>
            Share your question with the community. Be specific and include relevant details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question? Be specific."
              disabled={submitting}
              maxLength={200}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          {/* AI Suggestion */}
          {title.trim() && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">AI Suggestion</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAskAI}
                  disabled={aiLoading || submitting}
                  className="h-8"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Get AI Help
                    </>
                  )}
                </Button>
              </div>
              {aiSuggestion && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      AI suggestion for your question:
                    </p>
                    <p className="text-sm whitespace-pre-wrap mb-3">
                      {aiSuggestion}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseAISuggestion}
                      disabled={submitting}
                    >
                      Use This Suggestion
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide more context about your question..."
              className="min-h-[200px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Tags
            </Label>
            <Card>
              <CardContent className="pt-4">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading tags...</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  Select relevant tags to help others find your question
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Selected Tags Summary */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => {
                  const tag = availableTags.find(t => t.id === tagId);
                  return tag ? (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {tag.name}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => handleTagToggle(tagId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </form>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim() || !description}
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Question'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 