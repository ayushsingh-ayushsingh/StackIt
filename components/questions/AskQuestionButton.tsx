'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AskQuestionModal from './AskQuestionModal';

interface AskQuestionButtonProps {
  onQuestionSubmitted?: () => void;
}

export default function AskQuestionButton({ onQuestionSubmitted }: AskQuestionButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleQuestionSubmitted = () => {
    handleCloseModal();
    onQuestionSubmitted?.();
  };

  return (
    <>
      <Button 
        onClick={handleOpenModal}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ask Question
      </Button>
      
      <AskQuestionModal 
        isOpen={isModalOpen} 
        onClose={handleQuestionSubmitted} 
      />
    </>
  );
} 