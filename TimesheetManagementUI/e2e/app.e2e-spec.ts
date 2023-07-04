import { TimesheetManagement.UIPage } from './app.po';

describe('timesheet-management.ui App', () => {
  let page: TimesheetManagement.UIPage;

  beforeEach(() => {
    page = new TimesheetManagement.UIPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
