
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepetitionService } from '../../services/repetition.service';
import * as RepetitionModel from '../../models/user_repetition.model';
import * as QuestionModel from '../../models/question.model';


const mockRepetitionsCollection = {
    find: vi.fn(),
    countDocuments: vi.fn(),
    findOne: vi.fn(),
};

const mockQuestionsCollection = {
    find: vi.fn(),
};

vi.spyOn(RepetitionModel, 'getUserRepetitionsCollection').mockResolvedValue(mockRepetitionsCollection as any);
vi.spyOn(QuestionModel, 'getQuestionsCollection').mockResolvedValue(mockQuestionsCollection as any);

describe('Repetition Integration Flow', () => {
    const service = new RepetitionService();
    const userId = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should enhance due questions with question data', async () => {
        const now = new Date();
        // Mock due repetitions
        const mockCursor = {
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue([
                        { questionId: 'q1', interval: 1, repetitions: 1, nextReviewDate: now }
                    ])
                })
            })
        };
        mockRepetitionsCollection.find.mockReturnValue(mockCursor);

        // Mock questions
        mockQuestionsCollection.find.mockReturnValue({
            toArray: vi.fn().mockResolvedValue([
                { questionId: 'q1', text: 'Question 1', options: [] }
            ])
        });

        const dueQuestions = await service.getDueQuestions(userId);

        expect(dueQuestions).toHaveLength(1);
        expect(dueQuestions[0].questionId).toBe('q1');
        expect(dueQuestions[0].text).toBe('Question 1');
        expect(dueQuestions[0].repetition).toBeDefined();
    });

    it('should calculate stats correctly', async () => {
        mockRepetitionsCollection.countDocuments
            .mockResolvedValueOnce(10) // Total
            .mockResolvedValueOnce(5)  // Learning
            .mockResolvedValueOnce(3)  // Young
            .mockResolvedValueOnce(2); // Mature

        mockRepetitionsCollection.findOne.mockResolvedValue({ nextReviewDate: new Date() });

        const stats = await service.getStats(userId);

        expect(stats.totalCards).toBe(10);
        expect(stats.learningCount).toBe(5);
        expect(stats.youngCount).toBe(3);
        expect(stats.matureCount).toBe(2);
    });
});
