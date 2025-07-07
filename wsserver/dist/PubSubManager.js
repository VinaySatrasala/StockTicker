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
exports.PubSubManager = void 0;
const redis_1 = require("redis");
class PubSubManager {
    constructor() {
        this.subscriptions = new Map();
        this.redisSubscribed = new Set();
    }
    static getInstance() {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient = (0, redis_1.createClient)();
            yield this.redisClient.connect();
        });
    }
    handleStock(stock, price) {
        const sockets = this.subscriptions.get(stock);
        if (!sockets)
            return;
        for (const socket of sockets) {
            try {
                socket.send(JSON.stringify({ stock, price }));
            }
            catch (err) {
                console.error(`Failed to send to socket: ${err}`);
            }
        }
    }
    userSubscribe(stock, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            let sockets = this.subscriptions.get(stock);
            if (!sockets) {
                sockets = new Set();
                this.subscriptions.set(stock, sockets);
            }
            sockets.add(socket);
            // Subscribe to Redis only once per stock
            if (!this.redisSubscribed.has(stock)) {
                yield this.redisClient.subscribe(stock, (message) => {
                    this.handleStock(stock, message);
                });
                this.redisSubscribed.add(stock);
            }
        });
    }
    userUnSubscribe(stock, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            const sockets = this.subscriptions.get(stock);
            if (!sockets)
                return;
            sockets.delete(socket);
            if (sockets.size === 0) {
                yield this.redisClient.unsubscribe(stock);
                this.redisSubscribed.delete(stock);
                this.subscriptions.delete(stock);
            }
        });
    }
    cleanupSocket(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [stock, sockets] of this.subscriptions.entries()) {
                if (sockets.has(socket)) {
                    yield this.userUnSubscribe(stock, socket);
                }
            }
        });
    }
}
exports.PubSubManager = PubSubManager;
