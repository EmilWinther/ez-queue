"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const QueueDatabase_1 = require("../src/QueueDatabase");
const queueDb = new QueueDatabase_1.QueueDatabase();
queueDb.viewQueue();
queueDb.enqueue('user1');
queueDb.enqueue('user2');
queueDb.viewQueue();
setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
    const dequeuedUser = yield queueDb.dequeue();
    console.log(`Dequeued user: ${dequeuedUser}`);
    const dequeuedUser2 = yield queueDb.dequeue();
    console.log(`Dequeued user: ${dequeuedUser2}`);
}), 1000);
queueDb.viewQueue();
