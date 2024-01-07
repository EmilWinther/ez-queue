import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { QueueDatabase } from '../src/QueueDatabase';
import { MongoDBDatabase } from '../src/DbDefinitions/MongoDbDatabase';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const db = new MongoDBDatabase('mongodb://localhost:27017');
const queueDb = new QueueDatabase(db);

db.connect().then(() => {
  io.on('connection', async (socket) => {
    console.log('a user connected');
    await queueDb.enqueue(socket.id);

    socket.on('disconnect', async () => {
      console.log('user disconnected');
      await queueDb.dequeue();
      const updatedQueue = await queueDb.viewQueue();
      io.emit('queueUpdate', updatedQueue);
      io.emit('usersInFront', await queueDb.usersInFront(updatedQueue[0].count));
    });
  });

  server.listen(3000, () => {
    console.log('listening on *:3000');
  });
}).catch((error) => {
  console.error('Failed to connect to the database', error);
});