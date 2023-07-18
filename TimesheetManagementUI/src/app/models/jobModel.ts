export class JobModel {
    constructor(
        public Id : number,
        public Name : string,
        public Description : string,
        public ProjectId: number,
        public IsBillable: boolean
    ){}
}
