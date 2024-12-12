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
  datastore: { header: string; description: string }[] = [];
  loading = false;
  errorMessage: string | null = null;

  private readonly apiUrl = '/api'; // Proxy endpoint

  constructor(private http: HttpClient) {}

  fetchContent(): void {
    this.loading = true;
    this.errorMessage = null;

    this.fetchContentByTags(['h1', 'h2', 'h3']).subscribe({
      next: ({ headers, descriptions }) => {
        this.datastore = this.safeMapHeadersAndDescriptions(headers, descriptions);
      },
      error: (err) => {
        this.errorMessage = `Error: ${err.message ?? 'Unknown error'}`;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private safeMapHeadersAndDescriptions(
    headers: string[],
    descriptions: string[]
  ): { header: string; description: string }[] {
    // Ensure headers and descriptions are arrays and safely mapped
    if (!Array.isArray(headers) || !Array.isArray(descriptions)) {
      throw new Error('Invalid data format: headers and descriptions must be arrays.');
    }

    return headers.map((header, index) => {
      const description = descriptions[index] ?? ''; // Nullish coalescing for safety
      return {
        header: header.trim(), // Ensure header is a string and trim unnecessary spaces
        description: description.trim(), // Ensure description is a string and trim
      };
    });
  }


  fetchContentByTags(tags: string[]): Observable<{ headers: string[]; descriptions: string[] }> {
    return this.http.get(this.apiUrl, { responseType: 'text' }).pipe(
      map((response: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response, 'text/html');

        const headers = tags.flatMap((tag) =>
          Array.from(doc.querySelectorAll(tag)).map((el) => el.textContent?.trim() ?? '') // Use nullish coalescing operator
        );

        const descriptions = Array.from(doc.querySelectorAll('p'))
          .map((el) => el.textContent?.trim() ?? '') // Use nullish coalescing operator
          .filter((text) => text);

        return { headers, descriptions };
      }),
      catchError(() => throwError(() => new Error('Failed to fetch content'))) // Avoid direct rethrow
    );
  }
}
