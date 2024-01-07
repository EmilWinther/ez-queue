export interface QueueRow {
    userId: string;
    count: number;
}

export interface User {
    userId: string;
    queuePosition: number;
}