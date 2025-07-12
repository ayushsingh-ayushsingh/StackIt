'use client';

import SiteHeader from "@/components/custom/siteHeader"
import SearchBar from "@/components/search/SearchBar"
import QuestionsList from "@/components/questions/QuestionsList"
import AskQuestionButton from "@/components/questions/AskQuestionButton"
import { useSearch } from "@/hooks/useSearch"

export default function Home() {
  const {
    searchTerm,
    loading,
    handleSearchChange,
    clearSearch
  } = useSearch();

  return (
    <div>
      <nav className="fixed top-0 w-full z-50 bg-background/10 backdrop-blur-xs">
        <SiteHeader />
      </nav>
      <main className="mx-auto max-w-4xl p-4 mt-12 z-1 min-h-[100vh]">
        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center justify-between gap-4 my-6">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              loading={loading}
              placeholder="Search questions, tags, or authors..."
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <AskQuestionButton />
          </div>
        </div>
        
        <QuestionsList />
      </main>
      <footer className='my-2 w-full flex justify-center text-primary'>
        Crafted with ❤️ by <a href="https://www.github.com/ayushsingh-ayushsingh" className='ml-2 underline cursor-pointer' target='_blank' rel="noopener noreferrer">Ayush Singh</a>
      </footer>
    </div>
  )
}