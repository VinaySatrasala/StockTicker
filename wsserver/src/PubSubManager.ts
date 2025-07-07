import { WebSocketServer, WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";

export class PubSubManager {
    private static instance: PubSubManager;
    private redisClient!: RedisClientType;
    private subscriptions: Map<string, Set<WebSocket>>;
    private redisSubscribed: Set<string>;

    private constructor() {
        this.subscriptions = new Map();
        this.redisSubscribed = new Set();
    }

    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }

    public async init() {
        this.redisClient = createClient();
        await this.redisClient.connect();
    }

    public handleStock(stock: string, price: string) {
        const sockets = this.subscriptions.get(stock);
        if (!sockets) return;

        for (const socket of sockets) {
            try {
                socket.send(JSON.stringify({ stock, price }));
            } catch (err) {
                console.error(`Failed to send to socket: ${err}`);
            }
        }
    }

    public async userSubscribe(stock: string, socket: WebSocket): Promise<void> {
        let sockets = this.subscriptions.get(stock);
        if (!sockets) {
            sockets = new Set();
            this.subscriptions.set(stock, sockets);
        }

        sockets.add(socket);

        // Subscribe to Redis only once per stock
        if (!this.redisSubscribed.has(stock)) {
            await this.redisClient.subscribe(stock, (message) => {
                this.handleStock(stock, message);
            });
            this.redisSubscribed.add(stock);
        }
    }

    public async userUnSubscribe(stock: string, socket: WebSocket): Promise<void> {
        const sockets = this.subscriptions.get(stock);
        if (!sockets) return;

        sockets.delete(socket);

        if (sockets.size === 0) {
            await this.redisClient.unsubscribe(stock);
            this.redisSubscribed.delete(stock);
            this.subscriptions.delete(stock);
        }
    }

    public async cleanupSocket(socket: WebSocket): Promise<void> {
        for (const [stock, sockets] of this.subscriptions.entries()) {
            if (sockets.has(socket)) {
                await this.userUnSubscribe(stock, socket);
            }
        }
    }
}