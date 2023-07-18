export class Job {
    constructor(
        public Id : number,
        public Name : string,
        public Date: string,
        public Description : string,
        public IsBillable: boolean,        
        public CreatedId: number,  
        public StatusId: boolean,              
        public ProjectId: number
    ){}
}
