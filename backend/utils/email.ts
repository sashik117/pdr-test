import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "09b9787e036b20",
        pass: "4f4e64a71a2b83",
    },
});

export async function sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: '"ПДР Україна" <noreply@pdr-ukraine.com>',
        to: email,
        subject: "Підтвердження email - ПДР Україна",
        html: `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Підтвердження Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🚗 ПДР Україна</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Вітаємо, ${name}!</h2>

                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Дякуємо за реєстрацію на платформі <strong>ПДР Україна</strong>.
                                Для завершення реєстрації, будь ласка, підтвердіть вашу email адресу.
                            </p>

                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Натисніть на кнопку нижче, щоб підтвердити ваш email:
                            </p>

                            <!-- Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${verificationUrl}"
                                           style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                                            Підтвердити Email
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                Або скопіюйте і вставте це посилання у ваш браузер:
                            </p>
                            <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${verificationUrl}
                            </p>

                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">

                            <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                <strong>Важливо:</strong> Це посилання дійсне протягом 24 годин.
                                Якщо ви не реєструвались на нашій платформі, просто проігноруйте цей лист.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                З повагою,<br>
                                Команда ПДР Україна
                            </p>
                            <p style="margin: 0; color: #cccccc; font-size: 12px;">
                                © 2024 ПДР Україна. Всі права захищені.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
Вітаємо, ${name}!

Дякуємо за реєстрацію на платформі ПДР Україна.

Для завершення реєстрації, будь ласка, підтвердіть вашу email адресу, перейшовши за посиланням:

${verificationUrl}

Це посилання дійсне протягом 24 годин.

Якщо ви не реєструвались на нашій платформі, просто проігноруйте цей лист.

З повагою,
Команда ПДР Україна
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Не вдалося відправити email для верифікації");
    }
}

export async function sendWelcomeEmail(
    email: string,
    name: string,
): Promise<void> {
    const mailOptions = {
        from: '"ПДР Україна" <noreply@pdr-ukraine.com>',
        to: email,
        subject: "Ласкаво просимо до ПДР Україна! 🎉",
        html: `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 Email підтверджено!</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Вітаємо, ${name}!</h2>

                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Ваш email успішно підтверджено! Тепер ви можете користуватись всіма можливостями платформи.
                            </p>

                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                                <h3 style="margin: 0 0 10px; color: #333333; font-size: 18px;">Що ви можете робити:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 16px; line-height: 1.8;">
                                    <li>Проходити тести з 117 білетів ПДР</li>
                                    <li>Переглядати детальні пояснення до кожного питання</li>
                                    <li>Відстежувати прогрес навчання</li>
                                    <li>Переглядати історію тестів та статистику</li>
                                </ul>
                            </div>

                            <table role="presentation" style="margin: 30px auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard"
                                           style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                                            Розпочати навчання
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center;">
                                Успіхів на іспиті! 🚗💨
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f8f8; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                З повагою,<br>
                                Команда ПДР Україна
                            </p>
                            <p style="margin: 0; color: #cccccc; font-size: 12px;">
                                © 2024 ПДР Україна. Всі права захищені.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `,
        text: `
Вітаємо, ${name}!

Ваш email успішно підтверджено!

Тепер ви можете користуватись всіма можливостями платформи:
- Проходити тести з 117 білетів ПДР
- Переглядати детальні пояснення до кожного питання
- Відстежувати прогрес навчання
- Переглядати історію тестів та статистику

Успіхів на іспиті! 🚗💨

З повагою,
Команда ПДР Україна
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}

export async function sendTestEmail(email: string): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: '"ПДР Україна" <noreply@pdr-ukraine.com>',
            to: email,
            subject: "Тестовий email",
            text: "Це тестовий email від ПДР Україна",
            html: "<p>Це тестовий email від ПДР Україна</p>",
        });
        return true;
    } catch (error) {
        console.error("Test email failed:", error);
        return false;
    }
}

export async function sendPasswordResetEmail(
    email: string,
    resetToken: string,
): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: '"ПДР Україна" <noreply@pdr-ukraine.com>',
        to: email,
        subject: "Скидання паролю - ПДР Україна",
        html: `
            <h1>Скидання паролю</h1>
            <p>Ви отримали цей лист, тому що ви (або хтось інший) зробили запит на скидання паролю для вашого облікового запису.</p>
            <p>Натисніть на посилання нижче, щоб скинути пароль:</p>
            <a href="${resetUrl}">Скинути пароль</a>
            <p>Якщо ви не робили цього запиту, просто проігноруйте цей лист.</p>
        `,
        text: `Скидання паролю. Перейдіть за посиланням: ${resetUrl}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Не вдалося відправити email для скидання паролю");
    }
}
