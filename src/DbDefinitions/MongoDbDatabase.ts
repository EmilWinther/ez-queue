import { MongoClient } from "mongodb";
import { QueueDatabaseInterface } from "../interfaces/QueueDatabaseInterface";
import { QueueRow, User } from "../interfaces/global";

/**
 * MongoDBDatabase class that implements the QueueDatabaseInterface.
 * This class is responsible for managing a queue of users in a MongoDB database.
 */
export class MongoDBDatabase implements QueueDatabaseInterface {
  private client: MongoClient;
  private db: any;

  /**
   * Constructor for the MongoDBDatabase class.
   * @param {string} uri - The connection string for the MongoDB database.
   */
  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  /**
   * Connects to the MongoDB database.
   * @throws Will throw an error if the connection fails.
   */
  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db("queueDb");
      console.info("Connected to the MongoDB database.");
    } catch (err: any) {
      console.error(err.message);
      throw err;
    }
  }

  /**
   * Adds a user to the queue in the MongoDB database.
   * @param {string} userId - The ID of the user to add to the queue.
   * @throws Will throw an error if the database connection is not established or if the operation fails.
   */
  async enqueue(userId: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database connection is not established.");
    }
    try {
      const collection = this.db.collection("queue");
      const count = await collection.countDocuments();
      const queuePosition = count + 1;
      const user: User = { userId, queuePosition };
      await collection.insertOne(user);
      console.info(
          `A user has been added to the queue: ${userId} at position: ${queuePosition} there are ${this.usersInFront(
              queuePosition
          )} in front of user: ${userId}`
      );
    } catch (err: any) {
      console.error("Error enqueuing user:", err.message);
      throw err;
    }
  }

  /**
   * Removes the first user from the queue in the MongoDB database.
   * @returns {Promise<string | null>} The ID of the user that was removed from the queue, or null if the queue was empty.
   * @throws Will throw an error if the operation fails.
   */
  async dequeue(): Promise<string | null> {
    try {
      const collection = this.db.collection("queue");
      const firstInQueue = await collection.findOne(
          {},
          { sort: { queuePosition: 1 } }
      );
      if (firstInQueue) {
        await collection.deleteOne({ _id: firstInQueue._id });
        console.info(
            `A user has been removed from the queue: ${firstInQueue.userId}`
        );
        return firstInQueue.userId;
      } else {
        console.info("The queue is empty.");
        return null;
      }
    } catch (err: any) {
      console.error(err.message);
      throw err;
    }
  }

  /**
   * Retrieves the current queue from the MongoDB database.
   * @returns {Promise<QueueRow[]>} An array of QueueRow objects representing the current queue.
   * @throws Will throw an error if the operation fails.
   */
  async viewQueue(): Promise<QueueRow[]> {
    try {
      const collection = this.db.collection("queue");
      const queue = await collection
          .find({})
          .sort({ queuePosition: 1 })
          .toArray();
      console.info("Current queue:", queue.length);
      return queue;
    } catch (err: any) {
      console.error(err.message);
      throw err;
    }
  }

  /**
   * Retrieves the number of users in front of a given position in the queue.
   * @param {number} position - The position in the queue to check.
   * @returns {Promise<number>} The number of users in front of the given position in the queue.
   * @throws Will throw an error if the operation fails.
   */
  async usersInFront(position: number): Promise<number> {
    try {
      const collection = this.db.collection("queue");
      const user = await collection.findOne({ queuePosition: position });
      if (user) {
        const usersInFront = await collection.countDocuments({
          queuePosition: { $lt: user.queuePosition },
        });
        console.info(
            `Number of users in front of position ${position}: ${usersInFront}`
        );
        return usersInFront;
      } else {
        console.info(`No user found at position ${position}.`);
        return 0;
      }
    } catch (err: any) {
      console.error(err.message);
      throw err;
    }
  }

  /**
   * Clears the queue in the MongoDB database.
   * @throws Will throw an error if the operation fails.
   */
  async clearCollection(): Promise<void> {
    try {
      const collection = this.db.collection("queue");
      await collection.deleteMany({});
      console.info("The collection has been cleared.");
    } catch (err: any) {
      console.error(err.message);
      throw err;
    }
  }
}