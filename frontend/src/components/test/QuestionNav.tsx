'use client';

import { cn } from '@/lib/utils';

interface QuestionNavProps {
  total: number;
  current: number;
  answers: Map<string, string>;
  questionIds: string[];
  onNavigate: (index: number) => void;
  results?: Map<string, boolean>;
  className?: string;
}

export default function QuestionNav({
  total,
  current,
  answers,
  questionIds,
  onNavigate,
  results,
  className,
}: QuestionNavProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {Array.from({ length: total }, (_, i) => {
        const questionId = questionIds[i];
        const isAnswered = answers.has(questionId);
        const isCurrent = i === current;
        const result = results?.get(questionId);

        return (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={cn(
              'w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200',
              isCurrent && 'ring-2 ring-primary-500 ring-offset-2',
              !results && isAnswered && 'bg-primary-500 text-white',
              !results && !isAnswered && 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              results && result === true && 'bg-success-500 text-white',
              results && result === false && 'bg-error-500 text-white',
              results && result === undefined && 'bg-gray-300 text-gray-600'
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
