import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyTimesheetEntryComponent } from './weekly-timesheet-entry.component';

describe('WeeklyTimesheetEntryComponent', () => {
  let component: WeeklyTimesheetEntryComponent;
  let fixture: ComponentFixture<WeeklyTimesheetEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklyTimesheetEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyTimesheetEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
