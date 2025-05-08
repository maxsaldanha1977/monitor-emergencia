// utils/time-utils.ts
//Não utilizado a função PAD apenas para dar uma vizualiação para o usuário mais amigável.

export function calcularDiferencaHora(horaCadastrada: string): string {
  let dataCadastrada: Date;
  
  // Tenta converter diretamente (formato ISO completo)
  const data = new Date(horaCadastrada);
  
  if (!isNaN(data.getTime())) {
    dataCadastrada = data;
  } else {
    // Se for só hora (ex: "14:30"), monta com a data de hoje
    const [hora, minuto] = horaCadastrada.split(':').map(Number);
    const hoje = new Date();
    hoje.setHours(hora, minuto, 0, 0);
    dataCadastrada = hoje;
  }
  
  const agora = new Date();
  
  // Ajusta para considerar apenas a diferença de data e hora
  const dataCadastradaComData = new Date(
    dataCadastrada.getFullYear(),
    dataCadastrada.getMonth(),
    dataCadastrada.getDate(),
    dataCadastrada.getHours(),
    dataCadastrada.getMinutes(),
    dataCadastrada.getSeconds()
  );
  
  const agoraComData = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
    agora.getHours(),
    agora.getMinutes(),
    agora.getSeconds()
  );
  
  const diferencaMs = agoraComData.getTime() - dataCadastradaComData.getTime();
  
  const diferencaTotalMinutos = Math.floor(Math.abs(diferencaMs) / 60000);
  const diferencaHoras = Math.floor(diferencaTotalMinutos / 60);
  const diferencaMinutos = diferencaTotalMinutos % 60;
  
  const prefixo = diferencaMs >= 0 ? 'Há' : 'Em';

  if(diferencaHoras < 1){
    return `${prefixo}  ${diferencaMinutos}min`;
  } else {
    return `${prefixo} ${diferencaHoras}h e ${diferencaMinutos}min`;
  }  
  
}
