import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxFileDropModule, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/types';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxFileDropModule],
  template: `
    <div class="description-container">
      <div class="description-editor">
        <h3>Hotel Description</h3>
        <textarea
          [(ngModel)]="description"
          (blur)="saveDescription()"
          rows="10"
          placeholder="Enter detailed hotel description..."
          class="description-textarea"
        ></textarea>
      </div>

      <div class="fax-sheet-section">
        <h3>Fax Sheet</h3>
        <ngx-file-drop
          [multiple]="false"
          (onFileDrop)="onFileDropped($event)"
          accept="application/pdf"
        >
          <ng-template ngx-file-drop-content-tmp>
            <div class="upload-area">
              <i class="material-icons">upload_file</i>
              <p>Drop PDF file here or click to upload</p>
            </div>
          </ng-template>
        </ngx-file-drop>

        <div *ngIf="currentFaxSheet" class="current-file">
          <p>Current file: {{ currentFaxSheet }}</p>
          <button (click)="viewFaxSheet()" class="view-btn">
            <i class="material-icons">visibility</i>
            View
          </button>
          <button (click)="removeFaxSheet()" class="remove-btn">
            <i class="material-icons">delete</i>
            Remove
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .description-container {
      padding: 1rem;
      display: grid;
      gap: 2rem;
    }

    .description-textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      line-height: 1.5;
      resize: vertical;
    }

    .fax-sheet-section {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
    }

    .upload-area {
      text-align: center;
      padding: 2rem;
      border: 2px dashed #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .upload-area i {
      font-size: 48px;
      color: #666;
    }

    .current-file {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .view-btn, .remove-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .view-btn {
      background: #0d6efd;
      color: white;
    }

    .remove-btn {
      background: #dc3545;
      color: white;
    }

    h3 {
      margin-bottom: 1rem;
      color: #333;
    }
  `]
})
export class DescriptionComponent implements OnInit {
  @Input() hotel!: Hotel;
  description: string = '';
  currentFaxSheet: string | null = null;

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.description = this.hotelService.getHotelData(this.hotel.id, 'description');
      this.currentFaxSheet = this.hotel.faxSheet || null;
    }
  }

  saveDescription() {
    if (this.hotel) {
      this.hotelService.saveHotelData(this.hotel.id, 'description', this.description);
    }
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        
        fileEntry.file((file: File) => {
          if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64String = e.target?.result as string;
              this.hotelService.updateHotelFaxSheet(this.hotel.id, base64String);
              this.currentFaxSheet = file.name;
            };
            reader.readAsDataURL(file);
          }
        });
      }
    }
  }

  viewFaxSheet() {
    if (this.hotel.faxSheet) {
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(
          `<iframe width='100%' height='100%' src='${this.hotel.faxSheet}'></iframe>`
        );
      }
    }
  }

  removeFaxSheet() {
    if (confirm('Are you sure you want to remove the fax sheet?')) {
      this.hotelService.updateHotelFaxSheet(this.hotel.id, null);
      this.currentFaxSheet = null;
    }
  }
}