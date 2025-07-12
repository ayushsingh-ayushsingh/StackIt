'use client';

import { useSearch } from '@/hooks/useSearch';
import SearchResults from '../search/SearchResults';

export default function QuestionsList() {
  const {
    searchTerm,
    questions,
    loading,
    error,
    total,
    handleSearchChange,
    clearSearch,
    searchQuestions
  } = useSearch();

  return (
    <SearchResults
      questions={questions}
      loading={loading}
      error={error}
      total={total}
      searchTerm={searchTerm}
      onRetry={() => searchQuestions(searchTerm)}
    />
  );
} 