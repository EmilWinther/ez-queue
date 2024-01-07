import { MongoDBDatabase } from '../src/DbDefinitions/MongoDbDatabase';

describe('MongoDBDatabase', () => {
    let queueDb: MongoDBDatabase;

    beforeAll(async () => {
        const uri = 'mongodb://localhost:27017';
        queueDb = new MongoDBDatabase(uri);
        await queueDb.connect();
    });

    beforeEach(async () => {
        const collection = queueDb['db'].collection('queue');
        await collection.deleteMany({});
    });

    afterAll(async () => {
        await queueDb['client'].close();
    });

    it('should enqueue users with correct positions', async () => {
        await queueDb.enqueue('user1');
        let queue = await queueDb.viewQueue();
        expect(queue[0]).toMatchObject({ userId: 'user1', queuePosition: 1 });
    
        await queueDb.enqueue('user2');
        queue = await queueDb.viewQueue();
        expect(queue).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ userId: 'user1', queuePosition: 1 }),
                expect.objectContaining({ userId: 'user2', queuePosition: 2 }),
            ])
        );
    });

    it('should dequeue users in the correct order', async () => {
        await queueDb.enqueue('user1');
        await queueDb.enqueue('user2');

        const dequeuedUser1 = await queueDb.dequeue();
        expect(dequeuedUser1).toEqual('user1');

        const dequeuedUser2 = await queueDb.dequeue();
        expect(dequeuedUser2).toEqual('user2');
    });

    it('should count users in front of a position', async () => {
        await queueDb.enqueue('user1');
        await queueDb.enqueue('user2');
        await queueDb.enqueue('user3');

        const count = await queueDb.usersInFront(3);
        expect(count).toEqual(2);
    });

    it('should return the correct queue when viewQueue is called', async () => {
        await queueDb.enqueue('user1');
        await queueDb.enqueue('user2');
        await queueDb.enqueue('user3');
    
        const queue = await queueDb.viewQueue();
        expect(queue).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ userId: 'user1', queuePosition: 1 }),
                expect.objectContaining({ userId: 'user2', queuePosition: 2 }),
                expect.objectContaining({ userId: 'user3', queuePosition: 3 }),
            ])
        );
    });

    it('should return the correct count when usersInFront is called', async () => {
        await queueDb.enqueue('user1');
        await queueDb.enqueue('user2');
        await queueDb.enqueue('user3');
        await queueDb.enqueue('user4');

        const count1 = await queueDb.usersInFront(1);
        expect(count1).toEqual(0);

        const count2 = await queueDb.usersInFront(2);
        expect(count2).toEqual(1);

        const count3 = await queueDb.usersInFront(3);
        expect(count3).toEqual(2);
    });
});