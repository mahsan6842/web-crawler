import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  k: { header: string; description: string }[] = [];
  loading = false;
  errorMessage: string | null = null;

  private readonly apiUrl = '/api'; // Proxy endpoint

  constructor(private http: HttpClient) {}

  fetchContent(): void {
    this.loading = true;
    this.errorMessage = null;

    this.fetchContentByTags(['h1', 'h2', 'h3']).subscribe({
      next: ({ headers, descriptions }) => {
        // Combine headers and descriptions into the `k` array
        this.k = headers.map((header, index) => ({
          header,
          description: descriptions[index] || '', // Handle cases where descriptions are fewer than headers
        }));
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

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
