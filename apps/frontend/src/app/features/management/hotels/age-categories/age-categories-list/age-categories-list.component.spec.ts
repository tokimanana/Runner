import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeCategoriesListComponent } from './age-categories-list.component';

describe('AgeCategoriesListComponent', () => {
  let component: AgeCategoriesListComponent;
  let fixture: ComponentFixture<AgeCategoriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeCategoriesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgeCategoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
