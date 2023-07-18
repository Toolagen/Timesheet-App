export class AddClientProject {
    constructor(
        public Id : number,
        public ClientId : number,
        public Client: string,
        public ProjectId : number,
        public Project: string,
        public Job: string,
        public JobId : number,        
        public Date: string,
        public Description: string,
        public IsBillable: boolean,
        public StatusId: boolean,
        public CreatedId: number        
    ){}
}