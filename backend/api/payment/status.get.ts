import { eventHandler, getQuery, createError } from "h3";
import { paymentService } from "../../services/payment.service";
import logger from "../../utils/logger";

/**
 * Get payment order status
 *
 * This endpoint is called by the frontend after redirect from LiqPay
 * to check the current status of an order.
 */
export default eventHandler(async (event) => {
    const query = getQuery(event);
    const orderId = query.orderId as string;

    if (!orderId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing orderId parameter",
        });
    }

    try {
        const order = await paymentService.getOrderStatus(orderId);

        if (!order) {
            throw createError({
                statusCode: 404,
                statusMessage: "Order not found",
            });
        }

        logger.info(`Order status check: ${orderId} - ${order.status}`);

        return {
            orderId: orderId,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }

        logger.error(`Error checking order status: ${error.message}`);
        throw createError({
            statusCode: 500,
            statusMessage: "Failed to get order status",
        });
    }
});
