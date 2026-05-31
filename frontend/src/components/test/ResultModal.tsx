'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, XCircle, RotateCcw, Home, List } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  onRetry?: () => void;
  onViewAnswers?: () => void;
  onGoHome?: () => void;
}

export default function ResultModal({
  isOpen,
  onClose,
  score,
  passed,
  correctAnswers,
  totalQuestions,
  onRetry,
  onViewAnswers,
  onGoHome,
}: ResultModalProps) {
  useEffect(() => {
    if (isOpen && passed) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen, passed]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="text-center py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className={cn(
            'w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6',
            passed ? 'bg-success-100' : 'bg-error-100'
          )}
        >
          {passed ? (
            <Trophy className="w-12 h-12 text-success-600" />
          ) : (
            <XCircle className="w-12 h-12 text-error-600" />
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'text-3xl font-bold mb-2',
            passed ? 'text-success-600' : 'text-error-600'
          )}
        >
          {passed ? 'Вітаємо!' : 'Спробуйте ще раз'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6"
        >
          {passed
            ? 'Ви успішно склали тест!'
            : 'На жаль, ви не набрали достатньо балів.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'inline-flex items-center justify-center w-32 h-32 rounded-full mb-6',
            passed ? 'bg-success-50' : 'bg-error-50'
          )}
        >
          <span
            className={cn(
              'text-5xl font-bold',
              passed ? 'text-success-600' : 'text-error-600'
            )}
          >
            {score}%
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-700 mb-8"
        >
          Правильних відповідей:{' '}
          <span className="font-bold">
            {correctAnswers} з {totalQuestions}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {onViewAnswers && (
            <Button variant="outline" onClick={onViewAnswers}>
              <List className="w-4 h-4 mr-2" />
              Переглянути відповіді
            </Button>
          )}
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Спробувати ще
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome}>
              <Home className="w-4 h-4 mr-2" />
              На головну
            </Button>
          )}
        </motion.div>
      </div>
    </Modal>
  );
}
