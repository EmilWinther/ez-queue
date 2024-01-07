import { QueueDatabase } from "./src";
import { SQLiteDatabase } from "./src/DbDefinitions/SQLiteDatabase";

async function main() {
    // Create a new SQLiteDatabase instance
    const db = new SQLiteDatabase();

    // Create a new QueueDatabase instance with the SQLiteDatabase instance
    const queueDb = new QueueDatabase(db);

    // Enqueue a user
    await queueDb.enqueue('user1');

    // View the queue
    const queue = await queueDb.viewQueue();
    console.log(queue);

    // Dequeue a user
    const dequeuedUser = await queueDb.dequeue();
    console.log(`Dequeued user: ${dequeuedUser}`);

    // Get the number of users in front of a position
    const usersInFront = await queueDb.usersInFront(1);
    console.log(`Users in front of position 1: ${usersInFront}`);
}

main().catch(console.error);