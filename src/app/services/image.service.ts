import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);

  constructor() { }
  getImage(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => URL.createObjectURL(blob)) // Converte Blob para URL
    );
  }

}
