import { MongoClient } from "mongodb";
import { QueueDatabaseInterface } from "../../interfaces/QueueDatabaseInterface";
import { QueueRow, User } from "../../interfaces/global";


export class MongoDBDatabase implements QueueDatabaseInterface {
  private client: MongoClient;
  private db: any;


  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }


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