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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
class QueueDatabase {
    constructor() {
        this.db = new sqlite3_1.default.Database(':memory:', (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
        });
        this.db.serialize(() => {
            this.db.run("CREATE TABLE queue (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT)");
        });
    }
    enqueue(userId) {
        const sql = `INSERT INTO queue (userId) VALUES (?)`;
        this.db.run(sql, [userId], (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log(`A user has been added to the queue: ${userId}`);
        });
    }
    dequeue() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const sql = `SELECT userId FROM queue ORDER BY id ASC LIMIT 1`;
                this.db.get(sql, [], (err, row) => {
                    if (err) {
                        reject(err.message);
                        return;
                    }
                    if (row) {
                        this.db.run(`DELETE FROM queue WHERE id = (SELECT id FROM queue ORDER BY id ASC LIMIT 1)`, [], (err) => {
                            if (err) {
                                reject(err.message);
                                return;
                            }
                            resolve(row.userId);
                        });
                    }
                    else {
                        resolve(null);
                    }
                });
            });
        });
    }
    viewQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const sql = `SELECT COUNT(*) FROM queue ORDER BY id ASC`;
                this.db.all(sql, [], (err, rows) => {
                    if (err) {
                        reject(err.message);
                        return;
                    }
                    resolve(rows);
                    console.log(rows.length);
                });
            });
        });
    }
}
exports.QueueDatabase = QueueDatabase;
