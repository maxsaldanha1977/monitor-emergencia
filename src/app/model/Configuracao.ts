export interface Configuracao { 
    idConfig?: number;
    descricao: string;
    tempoDisponibilidade: number; //Tempo de permanência do atendimento na tela
    tempoMedicao: number; //Tempo de medição do cálculo do processo de análise
    tempoRefreshTela: number; //Tempo de atualização transição dos slides
    tempoMaximoVisita: number;
    exibirExamePendente: boolean;
    exibirRegistroAtendimento: boolean;
    exames: any;
    postos: any
}