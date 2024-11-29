import { Component } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'] // Corrected from styleUrl to styleUrls
})
export class ButtonComponent {

  b1: string | null = null;

  makeRequest(url: string): Promise<string> {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`); // Fixed string interpolation
        }
        return response.text();
      })
      .catch((error) => `Failed: ${error.message}`); // Fixed string interpolation
  }

  onButton1Click() {
    const url = 'https://bbc.com';
    this.makeRequest(url).then((response) => {
      this.b1 = response.startsWith('Failed') ? response : `Success: ${response}`; // Fixed string interpolation
    });
  }

}
