export interface PostoPost {
  codPosto: string;
  situacao: string;
  codLocalInternacao: string; // Mantém para compatibilidade
  locaisSelecionados?: string[]; // Novo campo para múltiplos locais
}

