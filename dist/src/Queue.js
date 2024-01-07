"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor() {
        this.storage = [];
    }
    enqueue(item) {
        this.storage.push(item);
    }
    dequeue() {
        return this.storage.shift();
    }
    size() {
        return this.storage.length;
    }
}
exports.Queue = Queue;
