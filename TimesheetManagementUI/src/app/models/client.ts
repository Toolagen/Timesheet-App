import { Project } from "./project";

export class Client {
    public Projects?: Project[];
    constructor(
        public Id : number,             
        public Name : string,        
        public Description : string,
        public StatusId: number,
        public CreatedId : number
    ){}
}