'use client';

import { Loader2, Search, AlertCircle } from 'lucide-react';
import QuestionCard from '../questions/QuestionCard';

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

interface SearchResultsProps {
  questions: Question[];
  loading: boolean;
  error: string | null;
  total: number;
  searchTerm: string;
  onRetry?: () => void;
}

export default function SearchResults({
  questions,
  loading,
  error,
  total,
  searchTerm,
  onRetry
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error: {error}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (searchTerm && questions.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
        <p className="text-muted-foreground">
          No questions found for "{searchTerm}". Try different keywords or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchTerm && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Search Results
            </h2>
            <p className="text-muted-foreground">
              {total} {total === 1 ? 'result' : 'results'} for "{searchTerm}"
            </p>
          </div>
        </div>
      )}
      
      {!searchTerm && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-2xl font-bold text-foreground">Recent Questions</h2>
          <span className="text-sm text-muted-foreground">
            {total} questions
          </span>
        </div>
      )}
      
      <div className="grid gap-6">
        {questions.map((question) => (
          <QuestionCard 
            key={question.id} 
            question={question} 
            showFullContent={!!searchTerm} // Show full content for search results
          />
        ))}
      </div>
      
      {searchTerm && questions.length > 0 && (
        <div className="text-center pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {questions.length} of {total} results
          </p>
        </div>
      )}
    </div>
  );
} 