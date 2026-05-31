
import { describe, it, expect } from 'vitest';
import { RepetitionService } from '../../services/repetition.service';

// Mock dependencies if needed, but for algorithm logic we can test the class directly 
// if we mock the DB calls, or extracting the algorithm to a pure function would be better.
// For now, let's mock the DB calls since they are embedded in the service.

// We need to mock the module that exports the collection getters.
import { vi } from 'vitest';
import * as RepetitionModel from '../../models/user_repetition.model';

// Mock the model functions
const mockCollection = {
    findOne: vi.fn(),
    updateOne: vi.fn(),
    insertOne: vi.fn(),
};

vi.spyOn(RepetitionModel, 'getUserRepetitionsCollection').mockResolvedValue(mockCollection as any);

describe('RepetitionService SM-2 Algorithm', () => {
    const service = new RepetitionService();
    const userId = 'user123';
    const questionId = 'q1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize a new item correctly (Grade 4)', async () => {
        mockCollection.findOne.mockResolvedValue(null); // New item

        const result = await service.processReview(userId, questionId, 4);

        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(1);
        expect(result.easeFactor).toBe(2.5); // Initial 2.5
        expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it('should reset interval on failure (Grade 1)', async () => {
        mockCollection.findOne.mockResolvedValue({
            _id: '123',
            userId,
            questionId,
            interval: 10,
            repetitions: 3,
            easeFactor: 2.5,
            history: []
        });

        const result = await service.processReview(userId, questionId, 1);

        expect(result.interval).toBe(1);
        expect(result.repetitions).toBe(0);
        expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('should increase interval on success (Grade 4)', async () => {
        const initialEF = 2.5;
        // Mock existing item: Interval 1, Reps 1
        mockCollection.findOne.mockResolvedValue({
            _id: '123',
            userId,
            questionId,
            interval: 1,
            repetitions: 1,
            easeFactor: initialEF,
            history: []
        });

        const result = await service.processReview(userId, questionId, 4);

        // Logic: 
        // Reps 1 (existing) -> 2
        // Interval 1 -> 6 (hardcoded for reps=1 in service)
        // EF calculation: 2.5 + (0.1 - (5-4)*(0.08+(5-4)*0.02)) = 2.5 + (0.1 - 1 * 0.1) = 2.5

        expect(result.repetitions).toBe(2);
        expect(result.interval).toBe(6);
        expect(result.easeFactor).toBe(2.5);
    });

    it('should decrease Ease Factor on hard review (Grade 3)', async () => {
        const initialEF = 2.5;
        // Mock existing item: Reps 2, Interval 6
        mockCollection.findOne.mockResolvedValue({
            _id: '123',
            userId,
            questionId,
            interval: 6,
            repetitions: 2,
            easeFactor: initialEF,
            history: []
        });

        const result = await service.processReview(userId, questionId, 3);

        // EF Calculation:
        // q=3
        // 2.5 + (0.1 - (5-3)*(0.08+(5-3)*0.02))
        // 2.5 + (0.1 - 2 * (0.08 + 0.04))
        // 2.5 + (0.1 - 2 * 0.12)
        // 2.5 + (0.1 - 0.24)
        // 2.5 - 0.14 = 2.36

        expect(result.easeFactor).toBeCloseTo(2.36);
        expect(result.repetitions).toBe(3);
        // Interval = round(6 * 2.36) = 14
        expect(result.interval).toBe(14);
    });

    it('should not drop Ease Factor below 1.3', async () => {
        mockCollection.findOne.mockResolvedValue({
            _id: '123',
            userId,
            questionId,
            interval: 10,
            repetitions: 5,
            easeFactor: 1.3, // Already low
            history: []
        });

        // Grade 3 drops EF
        const result = await service.processReview(userId, questionId, 3);

        expect(result.easeFactor).toBe(1.3); // Should execute Math.max logic
    });
});
