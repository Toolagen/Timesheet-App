import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeAllocationDetailsComponent } from './time-allocation-details.component';

describe('TimeAllocationDetailsComponent', () => {
  let component: TimeAllocationDetailsComponent;
  let fixture: ComponentFixture<TimeAllocationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeAllocationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeAllocationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
