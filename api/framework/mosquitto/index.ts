import { MqttClient, connect } from "mqtt"

export class Mosquitto {
    private connection?: MqttClient;
    static client: Mosquitto;

    static async init(serverIp: String, serverPort: number, clientId: string, onConnect?: () => any) {
        this.client = new Mosquitto(serverIp, serverPort, clientId);
        await this.client.connect(onConnect)
    }

    private constructor(serverIp: String, serverPort: number, clientId: string) {
        this.connection = connect(`mqtt://${serverIp}:${serverPort}`, { clientId });
    }

    private async connect(onConnect?: () => any): Promise<void> {
        if (!this.connection?.connected) {
            await new Promise(resolve => {
                this.connection?.on('connect', () => {
                    resolve(null);
                });
            });
        }
        onConnect?.();
    }

    publish(topic: string, message: string): void {
        this.connection?.publish(topic, message);
    }

    disconnect(): void {
        this.connection?.end();
    }

}
