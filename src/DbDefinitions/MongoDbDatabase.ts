import { MongoClient } from 'mongodb';
import { QueueDatabaseInterface } from "../interfaces/QueueDatabaseInterface";
import { QueueRow } from '../interfaces/global';

export class MongoDBDatabase implements QueueDatabaseInterface {
    private client: MongoClient;
    private db: any;

    constructor(uri: string) { // Add the 'uri' parameter to the constructor
        this.client = new MongoClient(uri);
    }


    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db('queueDb');
            console.info('Connected to the MongoDB database.');
        } catch (err: any) {
            console.error(err.message);
            throw err;
        }
    }

    async enqueue(userId: string): Promise<void> {
        const collection = this.db.collection('queue');
        const count = await collection.countDocuments();
        const queuePosition = count + 1;
        await collection.insertOne({ userId, queuePosition });
        console.info(`A user has been added to the queue: ${userId} at position: ${queuePosition}`);
    }

    async dequeue(): Promise<string | null> {
        const collection = this.db.collection('queue');
        const firstInQueue = await collection.findOne({}, { sort: { queuePosition: 1 } });
        if (firstInQueue) {
            await collection.deleteOne({ _id: firstInQueue._id });
            console.info(`A user has been removed from the queue: ${firstInQueue.userId}`);
            return firstInQueue.userId;
        } else {
            console.info('The queue is empty.');
            return null;
        }
    }
    
    async viewQueue(): Promise<QueueRow[]> {
        const collection = this.db.collection('queue');
        const queue = await collection.find({}).sort({ queuePosition: 1 }).toArray();
        console.info('Current queue:', queue);
        return queue;
    }
    
    async usersInFront(position: number): Promise<number> {
        const collection = this.db.collection('queue');
        const user = await collection.findOne({ queuePosition: position });
        if (user) {
            const usersInFront = await collection.countDocuments({ queuePosition: { $lt: user.queuePosition } });
            console.info(`Number of users in front of position ${position}: ${usersInFront}`);
            return usersInFront;
        } else {
            console.info(`No user found at position ${position}.`);
            return 0;
        }
    }
}