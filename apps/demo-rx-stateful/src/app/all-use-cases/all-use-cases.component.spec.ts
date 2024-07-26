import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllUseCasesComponent } from './all-use-cases.component';

describe('AllUseCasesComponent', () => {
  let component: AllUseCasesComponent;
  let fixture: ComponentFixture<AllUseCasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllUseCasesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllUseCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
