import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetEntryReportComponent } from './timesheet-entry-report.component';

describe('TimesheetEntryReportComponent', () => {
  let component: TimesheetEntryReportComponent;
  let fixture: ComponentFixture<TimesheetEntryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetEntryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetEntryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
