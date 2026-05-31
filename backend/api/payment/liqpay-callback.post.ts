import { eventHandler, readBody } from "h3";
import { liqpayService } from "../../services/liqpay.service";
import { paymentService } from "../../services/payment.service";
import logger from "../../utils/logger";

/**
 * LiqPay Server-to-Server Callback Handler
 *
 * This endpoint receives payment status updates from LiqPay.
 * LiqPay sends POST requests with `data` and `signature` parameters.
 */
export default eventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { data, signature } = body;

        if (!data || !signature) {
            logger.warn("LiqPay callback: Missing data or signature");
            return { status: "error", message: "Missing data or signature" };
        }

        // Verify signature
        if (!liqpayService.verifyCallback(data, signature)) {
            logger.error("LiqPay callback: Invalid signature");
            return { status: "error", message: "Invalid signature" };
        }

        // Parse callback data
        const callbackData = liqpayService.parseCallbackData(data);

        logger.info(
            `LiqPay callback received: order_id=${callbackData.order_id}, status=${callbackData.status}`,
        );

        // Process the payment based on status
        const success = await paymentService.processLiqPayCallback(
            callbackData.order_id,
            callbackData.status,
            callbackData.transaction_id?.toString(),
        );

        if (success) {
            logger.info(
                `LiqPay callback processed successfully for order ${callbackData.order_id}`,
            );
        } else {
            logger.info(
                `LiqPay callback processed (payment not successful) for order ${callbackData.order_id}`,
            );
        }

        // LiqPay expects a simple response
        return { status: "ok" };
    } catch (error: any) {
        logger.error(`LiqPay callback error: ${error.message}`);
        return { status: "error", message: error.message };
    }
});
