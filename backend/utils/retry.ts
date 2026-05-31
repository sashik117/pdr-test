import logger from "./logger";

interface RetryOptions {
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
    factor?: number;
    onRetry?: (error: any, attempt: number) => void;
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const retries = options.retries || 3;
    const minTimeout = options.minTimeout || 1000;
    const maxTimeout = options.maxTimeout || 10000;
    const factor = options.factor || 2;

    let attempt = 0;
    let timeout = minTimeout;

    while (true) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            if (attempt > retries) {
                throw error;
            }

            if (options.onRetry) {
                options.onRetry(error, attempt);
            } else {
                logger.warn(`Retry attempt ${attempt} failed. Retrying in ${timeout}ms...`, { error });
            }

            await new Promise((resolve) => setTimeout(resolve, timeout));
            timeout = Math.min(timeout * factor, maxTimeout);
        }
    }
}
