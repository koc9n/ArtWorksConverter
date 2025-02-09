import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ConversionService } from '@services/conversion.service';
import { NotificationService } from '@core/services/notification.service';
import { ConversionJob } from '@core/models/conversion.model';
import { environment } from '@environments/environment';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-converter',
  template: `
    <div class="converter-container">
      <h2>Convert MP4 to GIF</h2>

      <app-file-upload
        *ngIf="!isConverting && !conversionCompleted"
        (fileSelected)="onFileSelected($event)">
      </app-file-upload>

      <app-conversion-progress
        *ngIf="isConverting"
        [progress]="conversionProgress">
      </app-conversion-progress>

      <app-result-display
        *ngIf="conversionCompleted"
        [job]="currentJob">
      </app-result-display>

      <div *ngIf="error" class="error-message mat-error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .converter-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    
    .error-message {
      margin: 16px 0;
      padding: 8px;
      border-radius: 4px;
    }
  `]
})
export class ConverterComponent implements OnDestroy {
  selectedFile: File | null = null;
  conversionProgress = 0;
  isConverting = false;
  conversionCompleted = false;
  error = '';
  gifUrl: SafeUrl | null = null;
  currentJob?: ConversionJob;
  private apiUrl = environment.apiUrl;
  private pollInterval?: number;

  constructor(
    private converterService: ConversionService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  validateVideo(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      // Basic validations first
      const maxSize = environment.maxVideoSize || 50 * 1024 * 1024; // 50MB default
      if (file.size > maxSize) {
        resolve(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      if (file.type !== 'video/mp4') {
        resolve('Only MP4 files are allowed');
        return;
      }

      // Create video element for metadata validation
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        
        // Duration validation
        const maxDuration = environment.maxVideoDuration || 30; // 30 seconds default
        if (video.duration > maxDuration) {
          resolve(`Video must be shorter than ${maxDuration} seconds`);
          return;
        }

        // Dimension validation
        const maxWidth = environment.maxVideoWidth || 1920; // 1920px default
        const maxHeight = environment.maxVideoHeight || 1080; // 1080px default
        if (video.videoWidth > maxWidth || video.videoHeight > maxHeight) {
          resolve(`Video dimensions must not exceed ${maxWidth}x${maxHeight}`);
          return;
        }

        resolve(null);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('Invalid video file');
      };

      video.src = url;
    });
  }

  async onFileSelected(event: any) {
    const file = event;
    if (!file) return;

    const error = await this.validateVideo(file);
    if (error) {
      this.notificationService.error(error);
      return;
    }

    this.selectedFile = file;
    this.startConversion();
  }

  private startConversion() {
    if (!this.selectedFile) return;

    this.isConverting = true;
    this.error = '';
    this.conversionCompleted = false;
    this.gifUrl = null;

    this.converterService.startConversion(this.selectedFile).subscribe({
      next: (response: ConversionJob) => {
        this.currentJob = response;
        this.startPolling(response.id);
      },
      error: (error) => {
        this.error = error.error?.error || 'Failed to upload file';
        this.isConverting = false;
        this.notificationService.error(this.error);
      }
    });
  }

  private startPolling(jobId: string) {
    this.pollInterval = window.setInterval(() => {
      this.converterService.getJobStatus(jobId).subscribe({
        next: (job) => {
          this.currentJob = job;
          
          if (job.state === 'completed') {
            this.stopPolling();
            this.notificationService.success('Conversion completed successfully');
            this.router.navigate(['/history']);
          } else if (job.state === 'failed') {
            this.stopPolling();
            this.notificationService.error(job.error || 'Conversion failed');
          }
        },
        error: (error) => {
          this.stopPolling();
          this.notificationService.error('Failed to get conversion status');
          console.error('Status polling error:', error);
        }
      });
    }, 1000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  reset() {
    this.selectedFile = null;
    this.conversionProgress = 0;
    this.isConverting = false;
    this.conversionCompleted = false;
    this.error = '';
    this.gifUrl = null;
    this.currentJob = undefined;
    this.stopPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }
} 