import { eventHandler, readBody, createError } from "h3";
import { paymentService } from "../../services/payment.service";
import logger from "../../utils/logger";

export default eventHandler(async (event) => {
    const body = await readBody(event);
    const { userId, plan } = body;

    if (!userId || !plan) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing userId or plan",
        });
    }

    if (plan !== "premium") {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid plan. Only 'premium' is supported.",
        });
    }

    try {
        const checkout = await paymentService.createLiqPayCheckout(
            userId,
            plan,
        );

        logger.info(
            `Checkout initiated for user ${userId}, order ${checkout.orderId}`,
        );

        return {
            checkoutUrl: checkout.checkoutUrl,
            data: checkout.data,
            signature: checkout.signature,
            orderId: checkout.orderId,
        };
    } catch (e: any) {
        logger.error(`Checkout error for user ${userId}: ${e.message}`);
        throw createError({
            statusCode: 500,
            statusMessage: e.message || "Failed to create checkout",
        });
    }
});
