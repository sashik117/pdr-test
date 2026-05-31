import { ObjectId } from "mongodb";
import { getOrdersCollection, Order } from "../models/order.model";
import {
    getSubscriptionsCollection,
    Subscription,
} from "../models/subscription.model";
import { getUsersCollection } from "../models/user.model";
import { liqpayService, LiqPayCheckoutParams } from "./liqpay.service";
import { config } from "../config";
import logger from "../utils/logger";

export interface CheckoutResult {
    checkoutUrl: string;
    data: string;
    signature: string;
    orderId: string;
}

export class PaymentService {
    private readonly PREMIUM_PRICE = 200;
    private readonly CURRENCY = "UAH";

    async createOrder(userId: string, plan: "premium"): Promise<string> {
        const orders = await getOrdersCollection();

        const order: Order = {
            userId,
            amount: this.PREMIUM_PRICE,
            currency: this.CURRENCY,
            status: "pending",
            paymentProvider: "liqpay",
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: { plan },
        };

        const result = await orders.insertOne(order);
        logger.info(`Order created: ${result.insertedId} for user ${userId}`);
        return result.insertedId.toString();
    }

    async createLiqPayCheckout(
        userId: string,
        plan: "premium",
    ): Promise<CheckoutResult> {
        const orderId = await this.createOrder(userId, plan);

        const frontendUrl = config.FRONTEND_URL || "http://localhost:3000";
        const backendUrl =
            process.env.BACKEND_URL || "http://localhost:3001/api";

        const checkoutParams: LiqPayCheckoutParams = {
            orderId,
            amount: this.PREMIUM_PRICE,
            currency: this.CURRENCY,
            description: "ПДР Україна - Premium підписка на 1 рік",
            resultUrl: `${frontendUrl}/pricing?orderId=${orderId}`,
            serverUrl: `${backendUrl}/payment/liqpay-callback`,
        };

        const { data, signature } =
            liqpayService.createCheckoutData(checkoutParams);
        const checkoutUrl = liqpayService.getCheckoutUrl();

        logger.info(
            `LiqPay checkout created for order ${orderId}, user ${userId}`,
        );

        return {
            checkoutUrl,
            data,
            signature,
            orderId,
        };
    }

    async processLiqPayCallback(
        orderId: string,
        status: string,
        transactionId?: string,
    ): Promise<boolean> {
        const orders = await getOrdersCollection();
        const users = await getUsersCollection();
        const subscriptions = await getSubscriptionsCollection();

        const order = await orders.findOne({
            _id: new ObjectId(orderId) as any,
        });

        if (!order) {
            logger.warn(`Order not found: ${orderId}`);
            return false;
        }

        // Check if already processed
        if (order.status === "completed") {
            logger.info(`Order ${orderId} already completed, skipping`);
            return true;
        }

        if (liqpayService.isPaymentSuccessful(status)) {
            // Update order to completed
            await orders.updateOne(
                { _id: new ObjectId(orderId) as any },
                {
                    $set: {
                        status: "completed",
                        updatedAt: new Date(),
                        transactionId: transactionId?.toString(),
                    },
                },
            );

            // Create/update subscription
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setFullYear(now.getFullYear() + 1);

            await subscriptions.updateOne(
                { userId: order.userId },
                {
                    $set: {
                        userId: order.userId,
                        plan: "premium",
                        startDate: now,
                        expiresAt: expiresAt,
                        isActive: true,
                        updatedAt: now,
                    },
                    $setOnInsert: { createdAt: now },
                },
                { upsert: true },
            );

            // Update user premium status
            await users.updateOne(
                { _id: new ObjectId(order.userId) as any },
                {
                    $set: {
                        isPremium: true,
                        subscriptionExpiresAt: expiresAt,
                    },
                },
            );

            logger.info(
                `Payment successful for order ${orderId}, user ${order.userId} upgraded to premium`,
            );
            return true;
        } else if (liqpayService.isPaymentFailed(status)) {
            // Update order to failed
            await orders.updateOne(
                { _id: new ObjectId(orderId) as any },
                {
                    $set: {
                        status: "failed",
                        updatedAt: new Date(),
                        transactionId: transactionId?.toString(),
                    },
                },
            );

            logger.info(
                `Payment failed for order ${orderId}, status: ${status}`,
            );
            return false;
        }

        // Payment is pending
        logger.info(`Payment pending for order ${orderId}, status: ${status}`);
        return false;
    }

    async getOrderStatus(orderId: string): Promise<Order | null> {
        const orders = await getOrdersCollection();
        return orders.findOne({ _id: new ObjectId(orderId) as any });
    }

    async getSubscriptionStatus(userId: string): Promise<boolean> {
        const subscriptions = await getSubscriptionsCollection();
        const sub = await subscriptions.findOne({ userId, isActive: true });

        if (!sub) return false;
        return sub.expiresAt > new Date();
    }

    // Keep mock payment for testing purposes
    async processMockPayment(orderId: string): Promise<boolean> {
        const orders = await getOrdersCollection();
        const users = await getUsersCollection();
        const subscriptions = await getSubscriptionsCollection();

        const order = await orders.findOne({
            _id: new ObjectId(orderId) as any,
        });
        if (!order || order.status !== "pending") {
            logger.warn(
                `Order processing failed: invalid order ${orderId} or status ${order?.status}`,
            );
            return false;
        }

        await orders.updateOne(
            { _id: new ObjectId(orderId) as any },
            {
                $set: {
                    status: "completed",
                    updatedAt: new Date(),
                    transactionId: `mock_${Date.now()}`,
                },
            },
        );

        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setFullYear(now.getFullYear() + 1);

        await subscriptions.updateOne(
            { userId: order.userId },
            {
                $set: {
                    userId: order.userId,
                    plan: "premium",
                    startDate: now,
                    expiresAt: expiresAt,
                    isActive: true,
                    updatedAt: now,
                },
                $setOnInsert: { createdAt: now },
            },
            { upsert: true },
        );

        await users.updateOne(
            { _id: new ObjectId(order.userId) as any },
            {
                $set: {
                    isPremium: true,
                    subscriptionExpiresAt: expiresAt,
                },
            },
        );

        logger.info(
            `Mock payment successful for order ${orderId}, user upgraded to premium`,
        );
        return true;
    }
}

export const paymentService = new PaymentService();
