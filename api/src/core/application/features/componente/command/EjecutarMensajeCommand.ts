import { Command } from "../../../behaviour/command";

export class EjecutarMensajeCommand extends Command {
    topico!: string;
    mensaje!: string;
}