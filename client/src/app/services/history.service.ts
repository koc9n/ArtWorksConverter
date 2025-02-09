import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ConversionJob } from '@core/models/conversion.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/convert/history`;

  constructor(private http: HttpClient) {}

  getHistory(): Observable<ConversionJob[]> {
    return this.http.get<ConversionJob[]>(this.apiUrl);
  }

  deleteJob(jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${jobId}`);
  }
} 