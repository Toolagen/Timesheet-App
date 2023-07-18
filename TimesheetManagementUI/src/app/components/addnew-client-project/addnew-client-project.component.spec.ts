import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddnewClientProjectComponent } from './addnew-client-project.component';

describe('AddnewClientProjectComponent', () => {
  let component: AddnewClientProjectComponent;
  let fixture: ComponentFixture<AddnewClientProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddnewClientProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddnewClientProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
