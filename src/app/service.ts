import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CrawlerService {
  private readonly apiUrl = '/api'; // Proxy endpoint

  constructor(private http: HttpClient) {}

  fetchContentByTags(tags: string[]): Observable<{ headers: string[]; descriptions: string[] }> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map((response: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response, 'text/html');

        const headers = tags.flatMap((tag) =>
          Array.from(doc.querySelectorAll(tag)).map((el) => el.textContent?.trim() || '')
        );

        const descriptions = Array.from(doc.querySelectorAll('p'))
          .map((el) => el.textContent?.trim() || '')
          .filter((text) => text);

        return { headers, descriptions };
      }),
      catchError((error) => throwError(() => new Error('Failed to fetch content')))
    );
  }
}
