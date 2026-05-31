
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestsService } from '../../services/tests.service';
import * as QuestionModel from '../../models/question.model';
import * as TestResultModel from '../../models/test_result.model';
import * as UserModel from '../../models/user.model';
import { repetitionService } from '../../services/repetition.service';

// Mock dependencies
const mockQuestionsCollection = {
    find: vi.fn(),
};

const mockTestResultsCollection = {
    insertOne: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
};

const mockUsersCollection = {
    findOne: vi.fn(),
};

vi.spyOn(QuestionModel, 'getQuestionsCollection').mockResolvedValue(mockQuestionsCollection as any);
vi.spyOn(TestResultModel, 'getTestResultsCollection').mockResolvedValue(mockTestResultsCollection as any);
vi.spyOn(UserModel, 'getUsersCollection').mockResolvedValue(mockUsersCollection as any);
vi.spyOn(repetitionService, 'processReview').mockResolvedValue({} as any);

describe('TestsService', () => {
    const service = new TestsService();
    const userId = 'user123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('submitTest', () => {
        it('should calculate score and pass/fail correctly', async () => {
            const input = {
                questions: ['q1', 'q2'],
                answers: [
                    { questionId: 'q1', answer: 'A' },
                    { questionId: 'q2', answer: 'B' }
                ],
                startedAt: new Date().toISOString()
            };

            // Mock DB questions
            mockQuestionsCollection.find.mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    { questionId: 'q1', correctAnswer: 'A' },
                    { questionId: 'q2', correctAnswer: 'A' } // Q2 is wrong
                ])
            });

            mockTestResultsCollection.insertOne.mockResolvedValue({ insertedId: 'test1' });

            const result = await service.submitTest(userId, input);

            expect(result.score).toBe(50); // 1/2 correct
            expect(result.passed).toBe(false); // 50% < 90%
            expect(result.correctAnswers).toBe(1);
            expect(mockTestResultsCollection.insertOne).toHaveBeenCalled();

            // Check SRS integration
            expect(repetitionService.processReview).toHaveBeenCalledTimes(2);
        });

        it('should pass if score >= 90%', async () => {
            const input = {
                questions: ['q1'],
                answers: [{ questionId: 'q1', answer: 'A' }],
                startedAt: new Date().toISOString()
            };

            mockQuestionsCollection.find.mockReturnValue({
                toArray: vi.fn().mockResolvedValue([
                    { questionId: 'q1', correctAnswer: 'A' }
                ])
            });

            mockTestResultsCollection.insertOne.mockResolvedValue({ insertedId: 'test1' });

            const result = await service.submitTest(userId, input);

            expect(result.score).toBe(100);
            expect(result.passed).toBe(true);
        });
    });

    describe('checkDailyLimit', () => {
        it('should allow premium users unlimited tests', async () => {
            mockUsersCollection.findOne.mockResolvedValue({ isPremium: true });

            const result = await service.checkDailyLimit(userId);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(Infinity);
            expect(result.isPremium).toBe(true);
        });

        it('should block free users after limit reached', async () => {
            mockUsersCollection.findOne.mockResolvedValue({ isPremium: false });
            mockTestResultsCollection.countDocuments.mockResolvedValue(3); // Limit is 3

            const result = await service.checkDailyLimit(userId);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should allow free users if under limit', async () => {
            mockUsersCollection.findOne.mockResolvedValue({ isPremium: false });
            mockTestResultsCollection.countDocuments.mockResolvedValue(1);

            const result = await service.checkDailyLimit(userId);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(2);
        });
    });
});
