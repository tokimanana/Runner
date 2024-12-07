import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxFileDropModule, NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { Hotel, DressCodePolicy } from '../../models/types';
import { HotelService } from '../../services/hotel.service';
import { Subscription, catchError, of } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-description',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxFileDropModule, ModalComponent],
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css']
})
export class DescriptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel: Hotel | null = null;
  description: string = '';
  dressCode: DressCodePolicy | null = null;
  currentFactSheet: string = '';
  private subscriptions: Subscription[] = [];

  // Modal related properties
  showModal = false;
  modalTitle = '';
  currentEditMode: 'description' | 'dressCode' = 'description';
  modalInitialValues: { [key: string]: string } = {};

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.loadHotelData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel'] && this.hotel) {
      this.loadHotelData();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadHotelData() {
    if (!this.hotel) return;

    // Subscribe to description
    this.subscriptions.push(
      this.hotelService.getHotelDescription(Number(this.hotel.id)).pipe(
        catchError((error: any) => {
          console.error('Error loading hotel description:', error);
          return of('');
        })
      ).subscribe((description: string) => {
        this.description = description || '';
      })
    );

    // Subscribe to dress code
    this.subscriptions.push(
      this.hotelService.getHotelDressCode(Number(this.hotel.id)).pipe(
        catchError((error: any) => {
          console.error('Error loading hotel dress code:', error);
          return of(null);
        })
      ).subscribe((dressCode: DressCodePolicy | null) => {
        this.dressCode = dressCode;
      })
    );

    // Subscribe to fact sheet
    this.subscriptions.push(
      this.hotelService.getHotelFactSheet(Number(this.hotel.id)).pipe(
        catchError((error: any) => {
          console.error('Error loading hotel fact sheet:', error);
          return of('');
        })
      ).subscribe((factSheet: string) => {
        this.currentFactSheet = factSheet || '';
      })
    );
  }

  openDescriptionModal() {
    this.currentEditMode = 'description';
    this.modalTitle = 'Edit Hotel Description';
    this.modalInitialValues = {
      ['description']: this.description
    };
    this.showModal = true;
  }

  openDressCodeModal() {
    this.currentEditMode = 'dressCode';
    this.modalTitle = 'Edit Dress Code';
    this.modalInitialValues = {
      ['dressCode']: JSON.stringify(this.dressCode)
    };
    this.showModal = true;
  }

  handleModalSubmit(formData: any) {
    if (!this.hotel) return;

    const value = formData[this.currentEditMode];
    const key = this.currentEditMode;

    // Update local state first
    if (key === 'description') {
      this.description = value;
    } else {
      this.dressCode = JSON.parse(value);
    }

    // Then save to service
    this.hotelService.saveHotelData(this.hotel.id, key, value)
      .pipe(
        catchError((error: any) => {
          console.error('Failed to save data:', error);
          // Revert local state on error
          if (key === 'description') {
            this.description = this.modalInitialValues['description'];
          } else {
            this.dressCode = JSON.parse(this.modalInitialValues['dressCode']);
          }
          return of(void 0);
        })
      )
      .subscribe();

    this.showModal = false;
  }

  handleModalCancel() {
    this.showModal = false;
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    if (!this.hotel) return;
    
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (file.type === 'application/pdf') {
            const previousFile = this.currentFactSheet;
            this.currentFactSheet = file.name;
            
            this.hotelService.saveHotelData(this.hotel!.id, 'factSheet', file.name)
              .pipe(
                catchError((error: any) => {
                  console.error('Failed to upload fact sheet:', error);
                  this.currentFactSheet = previousFile;
                  return of(void 0);
                })
              )
              .subscribe();
          }
        });
      }
    }
  }

  viewFactSheet() {
    if (this.hotel && this.currentFactSheet) {
      this.hotelService.getHotelData<string>(Number(this.hotel.id), 'factSheet').subscribe(
        (factSheet: string | null) => {
          if (factSheet) {
            window.open(factSheet, '_blank');
          }
        }
      );
    }
  }

  removeFactSheet() {
    if (this.hotel && this.currentFactSheet) {
      const previousFile = this.currentFactSheet;
      this.currentFactSheet = '';
      
      this.hotelService.saveHotelData(this.hotel.id, 'factSheet', null)
        .pipe(
          catchError((error: any) => {
            console.error('Failed to remove fact sheet:', error);
            this.currentFactSheet = previousFile;
            return of(void 0);
          })
        )
        .subscribe();
    }
  }
}