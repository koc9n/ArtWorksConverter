import { Component, Output, EventEmitter } from '@angular/core';
import { MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-file-upload',
  template: `
    <div class="upload-container" 
         (dragover)="onDragOver($event)" 
         (dragleave)="onDragLeave($event)"
         (drop)="onDrop($event)">
      <mat-card>
        <mat-card-content>
          <div class="upload-area" [class.dragover]="isDragging">
            <mat-icon>cloud_upload</mat-icon>
            <p>Drag and drop your MP4 file here or</p>
            <button mat-raised-button color="primary" (click)="fileInput.click()">
              Choose File
            </button>
            <input #fileInput type="file" 
                   accept="video/mp4" 
                   (change)="onFileSelected($event)"
                   style="display: none">
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
    }
    .upload-area {
      text-align: center;
      padding: 40px;
      border: 2px dashed #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .upload-area.dragover {
      border-color: primary;
      background: rgba(0,0,0,0.04);
    }
    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class FileUploadComponent {
  @Output() fileSelected = new EventEmitter<File>();
  isDragging = false;

  constructor(private snackBar: MatSnackBar) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.validateAndEmitFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.validateAndEmitFile(file);
    }
  }

  private validateAndEmitFile(file: File) {
    if (file.type !== 'video/mp4') {
      this.snackBar.open('Please select an MP4 file', 'Close', {
        duration: 3000
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      this.snackBar.open('File size must be less than 10MB', 'Close', {
        duration: 3000
      });
      return;
    }

    this.fileSelected.emit(file);
  }
} 