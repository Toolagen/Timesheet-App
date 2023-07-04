export class Project {
    constructor(
        public Id : number,
        public Name : string,
        public Description : string,
        public StartDate : string,
        public EndDate : string,
        public ClientId: number,
        public StatusId: number,
        public projectType: number,
        public CreatedId: number
    ){}
}
