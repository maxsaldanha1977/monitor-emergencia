import { Component, inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ConfiguracaoService } from '../../../services/configuracao.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostoService } from '../../../services/posto.service';
import { ExameService } from '../../../services/exame.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Posto } from '../../../model/Posto';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Exame } from '../../../model/Exame';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-editar',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCheckboxModule,  MatSelectModule, MatFormFieldModule, MatToolbarModule, RouterModule,MatButtonModule, MatTooltipModule],
  templateUrl: './editar.component.html',
  styleUrl: './editar.component.css',
})
export class EditarComponent implements OnInit {

  configuracaoService = inject(ConfiguracaoService);
  postosService = inject(PostoService);
  examesService = inject(ExameService);
  route = inject(ActivatedRoute);
  
  title = 'Editar Configuração de Perfil';

  item = {
    idConfig: 0,
    descricao: '',
    tempoDisponibilidade: 0,
    tempoMedicao: 0,
    tempoRefreshTela: 0,
    tempoMaximoVisita: 0,
    exibirExamePendente: false,
    exibirRegistroAtendimento: false,
    exames: [{}],
    postos: [{}],
  };

  exames: Exame[] = []; // Para exibir os checkboxes
  postos: Posto[] = []; // Para exibir os checkboxes
  selectedPostos: {[key: string]: boolean} = {}; // Para controlar os checkboxes
  selectedExames: {[key: string]: boolean} = {}; // Para controlar os checkboxes
  
  constructor( ) {}

  ngOnInit(): void {
    this.getById();
    this.getExames();
    this.getPostos();
  }

  getById(): void {
    try {
      const itemId = this.route.snapshot.paramMap.get('id');
      this.configuracaoService
        .getConfiguracaoById(itemId)
        .subscribe((response: any) => {
          this.item = response;
          console.log('From editar',response);
          
          // Inicializa o objeto selectedPostos após carregar os dados
          this.initializeSelectedPostos();
          this.initalizeSelectedExames();
        });
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Cadastro carregado com sucesso!',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        text: 'Ocorreu um erro, o caregamento não foi realizado!',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  // Inicializa o objeto selectedPostos marcando os postos que já estão no item
  initializeSelectedPostos(): void {
    this.selectedPostos = {};    
    if (this.item.postos && this.item.postos.length > 0) {
      this.item.postos.forEach((posto: any) => {
        // Usando codPosto como string
        if (posto.codPosto) {
          this.selectedPostos[posto.codPosto] = true;
        } else {
          console.warn('Posto sem codPosto válido:', posto);
        }
      });
    }
    console.log('Postos selecionados:', this.selectedPostos);
  }

  initalizeSelectedExames(): void { 
    this.selectedExames = {};
    if (this.item.exames && this.item.exames.length > 0) {
      this.item.exames.forEach((exame: any) => {
        // Usando codPosto como string
        if (exame.codExame) {
          this.selectedExames[exame.codExame] = true;
        } else {
          console.warn('Exames sem mne válido:', exame);
        }
      });
    }
    console.log('Exames selecionados:', this.selectedExames);
  }
  
  onPostoChange(codPosto: string, isChecked: boolean): void {
    this.selectedPostos[codPosto] = isChecked;
    
    // Atualiza o array de postos no item
    this.item.postos = Object.keys(this.selectedPostos)
      .filter(cod => this.selectedPostos[cod])
      .map(cod => ({ codPosto: cod })); // Mantém como string
      console.log('Postos cheange selecionados:', this.selectedPostos);
  }

  onExameChange(codMne: string, isChecked: boolean): void {
    this.selectedExames[codMne] = isChecked;
    
    // Atualiza o array de postos no item
    this.item.exames = Object.keys(this.selectedExames)
      .filter(cod => this.selectedExames[cod])
      .map(cod => ({ codMne: cod })); // Mantém como string
      console.log('Exames cheange selecionados:', this.selectedExames);
  }

  edit() {
    try {
      // Atualiza a lista de postos antes de enviar
      this.item.postos = Object.keys(this.selectedPostos)
        .filter(cod => this.selectedPostos[cod])
        .map(cod => ({ codPosto: cod })); // Mantém a estrutura com codPosto como string
  
        this.item.exames = Object.keys(this.selectedExames)
        .filter(cod => this.selectedExames[cod])
        .map(cod => ({ mne: cod })); // Mantém a estrutura com codPosto como string
  
      const id = this.route.snapshot.paramMap.get('id');
      this.configuracaoService.putConfiguracao(id, this.item).subscribe(() => {
        console.log('Item atualizado com sucesso!');
        Swal.fire({
          icon: 'success',
          title: 'Configuração atualizada!',
          timer: 1500
        });
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na atualização',
        text: 'Ocorreu um erro ao salvar as alterações'
      });
    }
  }

  // Método para obter os postos
  getPostos(): void {
    this.postosService.getAllPostos().subscribe((response: any) => {
      this.postos = response;
      console.log('Todos os postos:', response);
      
      // Garante que os postos são mapeados corretamente
      if (this.item.postos) {
        this.initializeSelectedPostos();
      }
    });
  }
  // Método para obter os exames
  getExames(): void {
    this.examesService.getAllExames().subscribe((response: any) => {
      this.exames = response;
      console.log('Todos os exames', response);

       // Garante que os postos são mapeados corretamente
       if (this.item.exames) {
        this.initalizeSelectedExames();
      }
    });
  }
}