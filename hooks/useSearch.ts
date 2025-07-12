import { useState, useEffect, useCallback } from 'react';

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

interface SearchResponse {
  questions: Question[];
  total: number;
  search: string;
}

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const searchQuestions = useCallback(async (search: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search.trim()) {
        params.append('search', search.trim());
      }
      params.append('limit', '20'); // Show more results for search
      
      const response = await fetch(`/api/questions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      
      const data: SearchResponse = await response.json();
      setQuestions(data.questions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQuestions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchQuestions(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchQuestions]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    questions,
    loading,
    error,
    total,
    handleSearchChange,
    clearSearch,
    searchQuestions
  };
} 