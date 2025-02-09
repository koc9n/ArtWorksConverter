import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ConversionJob } from '@core/models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startConversion(file: File): Observable<ConversionJob> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ConversionJob>(`${this.apiUrl}/convert`, formData);
  }

  getJobStatus(jobId: string): Observable<ConversionJob> {
    return this.http.get<ConversionJob>(`${this.apiUrl}/convert/${jobId}`);
  }

  getHistory(): Observable<ConversionJob[]> {
    return this.http.get<ConversionJob[]>(`${this.apiUrl}/convert/history`);
  }

  deleteFromHistory(jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/convert/history/${jobId}`);
  }

  getGifUrl(filename: string): string {
    return `${this.apiUrl}/shared/converted/${encodeURIComponent(filename)}`;
  }
} 