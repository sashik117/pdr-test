import { eventHandler, getQuery, sendRedirect } from "h3";
import { paymentService } from "../../services/payment.service";

export default eventHandler(async (event) => {
    const query = getQuery(event);
    const orderId = query.orderId as string;

    if (!orderId) {
        return "Missing orderId";
    }

    const success = await paymentService.processMockPayment(orderId);

    if (success) {
        return sendRedirect(
            event,
            "http://localhost:3000/pricing?success=true",
            302,
        );
    } else {
        return sendRedirect(
            event,
            "http://localhost:3000/pricing?error=start_failed",
            302,
        );
    }
});
