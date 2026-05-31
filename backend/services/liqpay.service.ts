import crypto from "crypto";
import { config } from "../config";
import logger from "../utils/logger";

export interface LiqPayCheckoutParams {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    resultUrl: string;
    serverUrl: string;
}

export interface LiqPayFormData {
    data: string;
    signature: string;
}

export interface LiqPayCallbackData {
    version: number;
    public_key: string;
    action: string;
    status: string;
    order_id: string;
    liqpay_order_id: string;
    payment_id: number;
    amount: number;
    currency: string;
    description: string;
    transaction_id: number;
    sender_phone?: string;
    sender_card_mask2?: string;
    sender_card_bank?: string;
    sender_card_type?: string;
    sender_card_country?: string;
    err_code?: string;
    err_description?: string;
}

class LiqPayService {
    private publicKey: string;
    private privateKey: string;

    constructor() {
        this.publicKey = config.LIQPAY_PUBLIC_KEY;
        this.privateKey = config.LIQPAY_PRIVATE_KEY;

        if (!this.publicKey || !this.privateKey) {
            logger.warn(
                "LiqPay keys not configured. Payment processing will fail.",
            );
        }

        logger.info(
            `LiqPay service initialized (sandbox: ${this.isSandbox()})`,
        );
    }

    /**
     * Generate base64-encoded data and signature for LiqPay checkout
     */
    createCheckoutData(params: LiqPayCheckoutParams): LiqPayFormData {
        const paymentData = {
            version: 3,
            public_key: this.publicKey,
            action: "pay",
            amount: params.amount,
            currency: params.currency,
            description: params.description,
            order_id: params.orderId,
            result_url: params.resultUrl,
            server_url: params.serverUrl,
            sandbox: this.isSandbox() ? 1 : 0,
        };

        const data = this.encodeBase64(JSON.stringify(paymentData));
        const signature = this.generateSignature(data);

        logger.info(`LiqPay checkout data created for order ${params.orderId}`);

        return { data, signature };
    }

    /**
     * Verify callback signature from LiqPay
     */
    verifyCallback(data: string, signature: string): boolean {
        const expectedSignature = this.generateSignature(data);
        const isValid = expectedSignature === signature;

        if (!isValid) {
            logger.warn("LiqPay callback signature verification failed");
        }

        return isValid;
    }

    /**
     * Decode and parse callback data from LiqPay
     */
    parseCallbackData(data: string): LiqPayCallbackData {
        const decoded = Buffer.from(data, "base64").toString("utf-8");
        return JSON.parse(decoded);
    }

    /**
     * Check if payment status indicates success
     */
    isPaymentSuccessful(status: string): boolean {
        // LiqPay successful statuses
        const successStatuses = ["success", "sandbox"];
        return successStatuses.includes(status);
    }

    /**
     * Check if payment is still pending/processing
     */
    isPaymentPending(status: string): boolean {
        const pendingStatuses = [
            "processing",
            "prepared",
            "wait_accept",
            "wait_secure",
            "wait_sender",
            "wait_lc",
            "wait_client",
            "wait_qr",
            "wait_svb",
            "subscribed",
        ];
        return pendingStatuses.includes(status);
    }

    /**
     * Check if payment failed
     */
    isPaymentFailed(status: string): boolean {
        const failedStatuses = [
            "failure",
            "error",
            "reversed",
            "try_again",
            "wait_reserve",
        ];
        return failedStatuses.includes(status);
    }

    /**
     * Get LiqPay checkout URL (for redirect-based flow)
     */
    getCheckoutUrl(): string {
        return "https://www.liqpay.ua/api/3/checkout";
    }

    /**
     * Check if running in sandbox mode
     */
    private isSandbox(): boolean {
        return this.publicKey.startsWith("sandbox_");
    }

    /**
     * Generate SHA1 signature for LiqPay
     */
    private generateSignature(data: string): string {
        const signString = this.privateKey + data + this.privateKey;
        return crypto.createHash("sha1").update(signString).digest("base64");
    }

    /**
     * Encode string to base64
     */
    private encodeBase64(str: string): string {
        return Buffer.from(str).toString("base64");
    }
}

export const liqpayService = new LiqPayService();
export default liqpayService;
