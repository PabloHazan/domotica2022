export class Accion {
    boton: string;
    mensaje: string;

    constructor(elBoton: string, laAccion: string) {
        this.boton = elBoton;
        this.mensaje = laAccion;
    }
}

export class Componente {
    public acciones: Array<Accion>; // [{ "accion": "Prender", "mensaje": "on"}, { "accion": "Apagar", "mensaje": "off"}]
    public topico: string; // casa/baño/luz
    public nombre: string

    constructor(elNombre: string, elTopico: string, lasAcciones: Array<Accion>) {
        this.nombre = elNombre;
        this.topico = elTopico;
        this.acciones = lasAcciones;
    }
}
