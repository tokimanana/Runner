import { Component, OnInit, OnDestroy, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxFileDropModule, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxFileDropModule],
  template: `
    <div class="description-container" *ngIf="hotel">
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

      <div class="dress-code-editor">
        <h3>Dress Code</h3>
        <textarea
          [(ngModel)]="dressCode"
          (blur)="saveDressCode()"
          rows="5"
          placeholder="Enter hotel dress code requirements (e.g., Smart casual required in all restaurants, No swimwear in indoor areas)..."
          class="description-textarea"
        ></textarea>
      </div>

      <div class="fact-sheet-section">
        <h3>Fact Sheet</h3>
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

        <div *ngIf="currentFactSheet" class="current-file">
          <p>Current file: {{ currentFactSheet }}</p>
          <button (click)="viewFactSheet()" class="view-btn">
            <i class="material-icons">visibility</i>
            View
          </button>
          <button (click)="removeFactSheet()" class="remove-btn">
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
      gap: 1.5rem;
    }

    .description-editor,
    .dress-code-editor {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .description-textarea {
      width: 100%;
      padding: 1rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 1rem;
      line-height: 1.5;
      resize: vertical;
      transition: border-color 0.2s ease;
    }

    .description-textarea:focus {
      outline: none;
      border-color: #0d6efd;
      box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }

    .fact-sheet-section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .upload-area {
      text-align: center;
      padding: 2rem;
      border: 2px dashed #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .upload-area:hover {
      border-color: #0d6efd;
      background: rgba(13, 110, 253, 0.02);
    }

    .upload-area i {
      font-size: 48px;
      color: #666;
    }

    .current-file {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
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
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: opacity 0.2s ease;
    }

    .view-btn:hover, .remove-btn:hover {
      opacity: 0.9;
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
      color: #1e293b;
      font-weight: 600;
    }
  `]
})
export class DescriptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel: Hotel | null = null;
  description: string = '';
  dressCode: string = '';
  currentFactSheet: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.loadHotelData(this.hotel);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel'] && !changes['hotel'].firstChange) {
      const hotel = changes['hotel'].currentValue;
      if (hotel) {
        this.loadHotelData(hotel);
      } else {
        this.resetData();
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadHotelData(hotel: Hotel) {
    this.subscription.add(
      this.hotelService.getHotelData<string>(hotel.id, 'description').subscribe(
        description => this.description = description || ''
      )
    );

    this.subscription.add(
      this.hotelService.getHotelData<string>(hotel.id, 'dressCode').subscribe(
        dressCode => this.dressCode = dressCode || ''
      )
    );

    this.subscription.add(
      this.hotelService.getHotelData<string>(hotel.id, 'factSheet').subscribe(
        factSheet => this.currentFactSheet = factSheet
      )
    );
  }

  private resetData() {
    this.description = '';
    this.dressCode = '';
    this.currentFactSheet = null;
  }

  saveDescription() {
    if (!this.hotel) return;
    
    const trimmedDescription = this.description.trim();
    if (trimmedDescription !== this.description) {
      this.description = trimmedDescription;
    }

    this.subscription.add(
      this.hotelService.saveHotelData(this.hotel.id, 'description', this.description)
        .subscribe({
          error: (error) => {
            console.error('Error saving description:', error);
            alert('Error saving description. Please try again.');
          }
        })
    );
  }

  saveDressCode() {
    if (!this.hotel) return;
    
    const trimmedDressCode = this.dressCode.trim();
    if (trimmedDressCode !== this.dressCode) {
      this.dressCode = trimmedDressCode;
    }

    this.subscription.add(
      this.hotelService.saveHotelData(this.hotel.id, 'dressCode', this.dressCode)
        .subscribe({
          error: (error) => {
            console.error('Error saving dress code:', error);
            alert('Error saving dress code. Please try again.');
          }
        })
    );
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    if (!this.hotel) return;

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        
        fileEntry.file((file: File) => {
          // Validate file type and size
          if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return;
          }
          
          // 10MB file size limit
          if (file.size > 10 * 1024 * 1024) {
            alert('File size should not exceed 10MB.');
            return;
          }

          const reader = new FileReader();
          
          reader.onerror = () => {
            alert('Error reading file. Please try again.');
          };

          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result && typeof e.target.result === 'string') {
              this.subscription.add(
                this.hotelService.updateHotelFactSheet(this.hotel!.id, e.target.result)
                  .subscribe({
                    next: () => {
                      this.currentFactSheet = file.name;
                    },
                    error: (error) => {
                      alert('Error uploading file. Please try again.');
                      console.error('File upload error:', error);
                    }
                  })
              );
            }
          };
          
          reader.readAsDataURL(file);
        });
      }
    }
  }

  viewFactSheet() {
    if (!this.hotel?.factSheet) return;

    try {
      // Create a blob from the base64 data
      const base64Data = this.hotel.factSheet.split(',')[1];
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Open PDF in a new tab using a safe URL
      const pdfWindow = window.open(url);
      
      // Clean up the blob URL when the window is closed
      if (pdfWindow) {
        pdfWindow.onbeforeunload = () => {
          URL.revokeObjectURL(url);
        };
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Error opening PDF. Please try again.');
    }
  }

  removeFactSheet() {
    if (!this.hotel) return;

    if (confirm('Are you sure you want to remove the fact sheet?')) {
      this.subscription.add(
        this.hotelService.updateHotelFactSheet(this.hotel.id, undefined)
          .subscribe({
            next: () => {
              this.currentFactSheet = null;
            },
            error: (error) => {
              console.error('Error removing fact sheet:', error);
              alert('Error removing fact sheet. Please try again.');
            }
          })
      );
    }
  }
}