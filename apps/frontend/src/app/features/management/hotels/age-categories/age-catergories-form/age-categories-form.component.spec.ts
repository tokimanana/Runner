import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeCategoriesFormComponent } from './age-categories-form.component';

describe('AgeCategoriesFormComponent', () => {
  let component: AgeCategoriesFormComponent;
  let fixture: ComponentFixture<AgeCategoriesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeCategoriesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgeCategoriesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
