// models/exame.model.ts
export interface Exame {
  mne: string;
}

// models/posto.model.ts
export interface Posto {
  codPosto: string;
  situacao: string;
  codLocalInternacao: string;
}

export interface ConfiguracaoPost {
  descricao: string;
  tempoDisponibilidade: string;
  tempoMedicao: string;
  tempoRefreshTela: string;
  tempoMaximoVisita: string;
  exibirExamePendente: string;
  exibirRegistroAtendimento: string;
  exames: Exame[];
  postos: Posto[];
}
