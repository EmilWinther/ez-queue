import sqlite3 from 'sqlite3';
import { QueueDatabaseInterface } from "../interfaces/QueueDatabaseInterface";
import { QueueRow } from '../interfaces/global';


export class SQLiteDatabase implements QueueDatabaseInterface {
    private db: sqlite3.Database;
    constructor() {
        this.db = new sqlite3.Database(':memory:', (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.info('Connected to the SQLite database.');
        });

        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT,
                queuePosition INTEGER
            )`, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }

    async enqueue(userId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const sqlCount = `SELECT COUNT(*) as count FROM queue`;
            this.db.get(sqlCount, [], (err, row: QueueRow) => {
                if (err) {
                    console.error(err.message);
                    reject(err.message);
                    return;
                }
                const queuePosition = row.count + 1;
                const sqlInsert = `INSERT INTO queue (userId, queuePosition) VALUES (?, ?)`;
                this.db.run(sqlInsert, [userId, queuePosition], (err) => {
                    if (err) {
                        console.error('User queue request rejected. Error: ' + err.message);
                        reject(err.message);
                        return;
                    }
                    console.info(`A user has been added to the queue: ${userId} at position: ${queuePosition}`);
                    resolve();
                });
            });
        });
    }

    async dequeue(): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT userId FROM queue ORDER BY queuePosition LIMIT 1`;
            this.db.get(sql, [], (err, row: QueueRow) => {
                if (err) {
                    console.error(err.message);
                    reject(err.message);
                    return;
                }
                if (row) {
                    const deleteSql = `DELETE FROM queue WHERE userId = ?`;
                    this.db.run(deleteSql, [row.userId], (err) => {
                        if (err) {
                            console.error('Deleting queue request rejected. Error: ' + err.message);
                            reject(err.message);
                            return;
                        }
                        const updateSql = `UPDATE queue SET queuePosition = queuePosition - 1 WHERE queuePosition > 1`;
                        this.db.run(updateSql, [], (err) => {
                            if (err) {
                                console.error('Updating queue request rejected. Error: ' + err.message);
                                reject(err.message);
                                return;
                            }
                            resolve(row.userId);
                        });
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async viewQueue(): Promise<QueueRow[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT userId, queuePosition FROM queue ORDER BY queuePosition`;
            this.db.all(sql, [], (err, rows: QueueRow[]) => {
                if (err) {
                    console.error('You can not view the queue. Error: ' + err.message);
                    reject(err.message);
                    return;
                }
                resolve(rows);
            });
        });
    }

    async usersInFront(position: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) as count FROM queue WHERE queuePosition < ?`;
            this.db.get(sql, [position], (err, row: QueueRow) => {
                if (err) {
                    console.error('You can not see the amount of users in front of you in the queue. Error: ' + err.message);
                    reject(err.message);
                    return;
                }
                resolve(row.count);
            });
        });
    }}