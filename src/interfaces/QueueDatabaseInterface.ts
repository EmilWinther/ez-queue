import { QueueRow } from "./global";

export interface QueueDatabaseInterface {
    enqueue(userId: string): Promise<void>;
    dequeue(): Promise<string | null>;
    viewQueue(): Promise<QueueRow[]>;
    usersInFront(position: number): Promise<number>;
    connect?(): Promise<void>;
    clearCollection?(): Promise<void>;
}