export interface ConfiguracaoUpdate {
    idConfig: string;
    descricao: string;
    tempoDisponibilidade: number;
    tempoMedicao: number;
    tempoRefreshTela: number;
    tempoMaximovisita: number;
    exibirExamePendente: boolean;
    exibirRegistroAtendimento: boolean;
    exames: any[]; // Se quiser, depois você pode tipar isso também
    postos: string[]; // Códigos dos postos selecionados
  }
  