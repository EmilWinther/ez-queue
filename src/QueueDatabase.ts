import { QueueDatabaseInterface } from './interfaces/QueueDatabaseInterface';
import { QueueRow } from './interfaces/global';

export class QueueDatabase {
    private db: QueueDatabaseInterface
    constructor(db: QueueDatabaseInterface) {
        this.db = db;
    }

    async enqueue(userId: string): Promise<void> {
        this.db.enqueue(userId);
    }

    async dequeue(): Promise<string | null> {
        return this.db.dequeue();
    }

    async viewQueue(): Promise<QueueRow[]> {
        return this.db.viewQueue();
    }

    async usersInFront(position: number): Promise<number> {
        return this.db.usersInFront(position);
    }
}