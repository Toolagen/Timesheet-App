import { Timesheet } from "./timesheet";

export class WeeklyTimeSheetDisplay{
    constructor(
        public ClientId: number,
        public ProjectId: number,
        public JobId: number,
        public Comments: string,
        public IsBillable: boolean,        
        public Monday: Timesheet[],
        public Tuesday: Timesheet[],
        public Wednesday: Timesheet[],
        public Thursday: Timesheet[],
        public Friday: Timesheet[],
        public Saturday: Timesheet[],
        public Sunday: Timesheet[]        
    ){}
}