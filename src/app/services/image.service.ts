import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
  defaultImage = 'assets/img/logo_bioslab.png';

  constructor() { }

getImage(url: string): Observable<string> {
  return this.http.get(url, { responseType: 'blob' }).pipe(
    map(blob => URL.createObjectURL(blob)),
    catchError(() => of(this.defaultImage))
  );
}

}
