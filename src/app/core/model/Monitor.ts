import { ExameMonitor } from "./ExameMonitor";

export interface Monitor {
    decorrido: string; 
    nomePaciente: any;
    codPaciente: any;
    codVisita: any;
    registroPosto: any;
    codPosto: any;
    situacao: any; 
    dtCadastro: any;
    dtVisita: any;
    dtUltimoMonitoramento: any;
    exames: ExameMonitor[];
}
