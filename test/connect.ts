import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('connected to server');
});
socket.on('queueUpdate', (updatedQueue) => {
    console.log('queueUpdate', updatedQueue);
  });
socket.on('disconnect', () => {
  console.log('disconnected from server');
});