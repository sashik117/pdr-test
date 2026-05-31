import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import config from "../config";
import logger from "../utils/logger";

const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

    // We can use mongodump if available, or manual JSON export for smaller datasets
    // For now, let's implement a manual JSON export to be dependency-free from system tools

    console.log(` Starting backup to ${backupPath}...`);
    logger.info(`Starting database backup to ${backupPath}`);

    const client = new MongoClient(config.MONGO_URI);

    try {
        await client.connect();
        const db = client.db();
        const collections = await db.listCollections().toArray();

        fs.mkdirSync(backupPath, { recursive: true });

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);

            const data = await collection.find({}).toArray();
            const filePath = path.join(backupPath, `${collectionName}.json`);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`  Exported ${collectionName}: ${data.length} documents`);
            logger.info(`Exported collection ${collectionName} (${data.length} docs)`);
        }

        // Create a metadata file
        const metadata = {
            timestamp: new Date(),
            collections: collections.map(c => c.name),
            version: "1.0.0"
        };

        fs.writeFileSync(path.join(backupPath, "metadata.json"), JSON.stringify(metadata, null, 2));

        console.log(` Backup completed successfully at ${backupPath}`);
        logger.info(`Backup completed successfully at ${backupPath}`);

        // Cleanup old backups (keep last 7 days)
        cleanupOldBackups();

    } catch (error) {
        console.error("Backup failed:", error);
        logger.error("Backup failed", { error });
        process.exit(1);
    } finally {
        await client.close();
    }
}

function cleanupOldBackups() {
    try {
        const backups = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith("backup-"))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Newest first

        // Keep last 5 backups
        const toDelete = backups.slice(5);

        for (const backup of toDelete) {
            fs.rmSync(backup.path, { recursive: true, force: true });
            console.log(`  Deleted old backup: ${backup.name}`);
            logger.info(`Deleted old backup: ${backup.name}`);
        }
    } catch (error) {
        logger.error("Failed to cleanup old backups", { error });
    }
}

// Execute if run directly
if (require.main === module) {
    backupDatabase();
}

export { backupDatabase };
