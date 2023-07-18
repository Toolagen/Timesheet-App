export class Timesheet {
    constructor(
        public Id : number,
        public Date : string,
        public Hours : number,
        public Comments : string,
        public IsBillable : boolean,
        public CreatedId : number,
        public ModifiedId : number,
        public ProjectId : number,
        public JobId : number,
        public ClientId : number,
    ){}
}
