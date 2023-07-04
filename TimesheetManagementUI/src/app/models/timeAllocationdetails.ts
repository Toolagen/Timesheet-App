export class TimeAllocationDetails {
    constructor(
        public Id : number,
        public ClientId : number,
        public Client : string,
        public ProjectId : number,
        public Project : string,
        public HoursAllocated: number,
        public HoursUtilised: number,
        public HoursRemaining: number,        
        public Date: string,
        public CreatedId: number,
        public ModifiedDate: string
    ) {}
}