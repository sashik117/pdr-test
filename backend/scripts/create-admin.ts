import { getUsersCollection, connectToDatabase } from "../utils/db";
import bcrypt from "bcryptjs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log("===========================================");
  console.log("  Створення адміністратора PDR Ukraine");
  console.log("===========================================\n");

  try {
    // Connect to database
    await connectToDatabase();
    console.log("✓ З'єднано з базою даних\n");

    const users = await getUsersCollection();

    // Check if any admin exists
    const existingAdmin = await users.findOne({ role: "admin" });
    if (existingAdmin) {
      const overwrite = await question(
        "⚠ Адміністратор вже існує. Створити ще одного? (y/n): "
      );
      if (overwrite.toLowerCase() !== "y") {
        console.log("\nОперація скасована.");
        rl.close();
        process.exit(0);
      }
    }

    // Get admin details
    console.log("\nВведіть дані нового адміністратора:\n");

    const email = await question("Email: ");
    if (!email || !email.includes("@")) {
      throw new Error("Невірний формат email");
    }

    // Check if user with this email exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error(`Користувач з email ${email} вже існує`);
    }

    const name = await question("Ім'я: ");
    if (!name || name.trim().length < 2) {
      throw new Error("Ім'я повинно містити мінімум 2 символи");
    }

    let password = await question("Пароль (мінімум 6 символів): ");
    if (!password || password.length < 6) {
      throw new Error("Пароль повинен містити мінімум 6 символів");
    }

    const confirmPassword = await question("Підтвердіть пароль: ");
    if (password !== confirmPassword) {
      throw new Error("Паролі не співпадають");
    }

    console.log("\nСтворення адміністратора...");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    password = ""; // Clear password from memory

    // Create admin user
    const newAdmin = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: "admin" as const,
      emailVerified: true, // Auto-verify admin
      createdAt: new Date(),
    };

    const result = await users.insertOne(newAdmin);

    console.log("\n✅ Адміністратора успішно створено!");
    console.log("\nДеталі:");
    console.log(`  ID: ${result.insertedId}`);
    console.log(`  Email: ${newAdmin.email}`);
    console.log(`  Ім'я: ${newAdmin.name}`);
    console.log(`  Роль: ${newAdmin.role}`);
    console.log(`  Email підтверджено: ${newAdmin.emailVerified}`);
    console.log("\n===========================================");
    console.log("Тепер ви можете увійти до адмін-панелі:");
    console.log("  URL: http://localhost:3002");
    console.log(`  Email: ${newAdmin.email}`);
    console.log("===========================================\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Помилка:", error instanceof Error ? error.message : error);
    rl.close();
    process.exit(1);
  }
}

// Handle Ctrl+C
rl.on("SIGINT", () => {
  console.log("\n\nОперація скасована користувачем.");
  rl.close();
  process.exit(0);
});

createAdmin();
