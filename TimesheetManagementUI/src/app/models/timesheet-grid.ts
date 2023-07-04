export class TimesheetGrid {
    constructor(
        public Id : number,
        public Project : string,
        public Job : string,
        public WorkDate : string,
        public WorkHour : number,
        public Comments : string,
        public Users : string,
        public UserId : number,
        public ProjectId : number,
        public JobId : number,
        public ClientId : number,
        public IsBillable:boolean,
        public Client:string,
        public StatusId: number,
    ){}
}
