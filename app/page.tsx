'use client';

import { useState } from 'react';
import SiteHeader from "@/components/custom/siteHeader"
import SearchBar from "@/components/search/SearchBar"
import QuestionsList from "@/components/questions/QuestionsList"
import AskQuestionButton from "@/components/questions/AskQuestionButton"
import AIAnswer from "@/components/ai/AIAnswer"
import AIAnswerLoading from "@/components/ai/AIAnswerLoading"
import { Button } from "@/components/ui/button"
import { Bot, Loader2 } from "lucide-react"
import { useSearch } from "@/hooks/useSearch"

interface AIAnswerData {
  question: string;
  answer: string;
  confidence: number;
}

export default function Home() {
  const {
    searchTerm,
    loading,
    handleSearchChange,
    clearSearch
  } = useSearch();

  const [aiAnswer, setAiAnswer] = useState<AIAnswerData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleQuestionSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAskAI = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a question in the search box first');
      return;
    }

    try {
      setAiLoading(true);
      setAiAnswer(null);

      const response = await fetch('/api/ai/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: searchTerm.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnswer(data);
      } else {
        const error = await response.json();
        console.error('AI Answer Error:', error);
        setAiAnswer({
          question: searchTerm.trim(),
          answer: 'Sorry, I could not generate an answer at this time. Please try again.',
          confidence: 0
        });
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiAnswer({
        question: searchTerm.trim(),
        answer: 'Sorry, I encountered an error while processing your question. Please try again.',
        confidence: 0
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCloseAIAnswer = () => {
    setAiAnswer(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl p-4 pt-8">
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              loading={loading}
              placeholder="Search questions, tags, or authors..."
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {searchTerm.trim() && (
              <Button
                onClick={handleAskAI}
                disabled={aiLoading || loading}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            )}
            <AskQuestionButton onQuestionSubmitted={handleQuestionSubmitted} />
          </div>
        </div>

        {/* AI Answer Section */}
        {aiLoading && (
          <AIAnswerLoading question={searchTerm} />
        )}
        
        {aiAnswer && !aiLoading && (
          <AIAnswer
            question={aiAnswer.question}
            answer={aiAnswer.answer}
            confidence={aiAnswer.confidence}
            onClose={handleCloseAIAnswer}
          />
        )}
        
        <QuestionsList key={refreshKey} />
      </main>
      <footer className='my-8 w-full flex justify-center text-primary'>
        Crafted with ❤️ by <a href="https://www.github.com/ayushsingh-ayushsingh" className='ml-2 underline cursor-pointer' target='_blank' rel="noopener noreferrer">Ayush Singh</a>
      </footer>
    </div>
  )
}