export class TimeAllocation {
    constructor(
        public Id : number,
        public ClientId : number,
        public ProjectId : number,
        public HoursAllocated: number,
        public Date: string,
        public CreatedId: number
    ){}
}