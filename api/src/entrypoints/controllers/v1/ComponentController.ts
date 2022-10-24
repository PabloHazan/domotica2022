import { AppController } from "../../../../framework/appController";
import { Controller } from "../../../../framework/decorators/controller.decorator";
import { Get, Patch } from "../../../../framework/decorators/method.decorator";
import { QueryParams, Body } from "../../../../framework/decorators/paramsController.decorator";
import { Mosquitto } from "../../../../framework/mosquitto";
import { EjecutarMensajeCommand } from "../../../core/application/features/componente/command/EjecutarMensajeCommand";
import { ObtenerTodosLosComponentesQuery } from "../../../core/application/features/componente/queries/ObtenerTodosLosComponentesQuery";
import { Accion, Componente } from "../../../core/domain/features/component/component";

const componentes: Array<Componente> = [
    new Componente('Luz del comedor', 'casa/comedor/luz', [new Accion('Prender', 'on'), new Accion('Apagar', 'off')]),
    new Componente('Luz del cocina', 'casa/cocina/luz', [new Accion('Prender', 'on'), new Accion('Apagar', 'off')]),
];

@Controller('componente')
export class ComponentController extends AppController {

    @Get({
        query: ObtenerTodosLosComponentesQuery
    })
    async obtenerTodosLosComponentes(@QueryParams query: ObtenerTodosLosComponentesQuery): Promise<Array<Componente>> {
        return componentes;
    }

    @Patch({
        body: EjecutarMensajeCommand
    })
    async ejecutarAccion(@Body orden: EjecutarMensajeCommand) {
        Mosquitto.client.publish(orden.topico, orden.mensaje);
        return 'ok';
    }

}