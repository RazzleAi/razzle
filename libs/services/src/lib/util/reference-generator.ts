import { v4 as uuidv4 } from 'uuid'

export class ReferenceGenerator {


    public static generate(): string {
        return `${uuidv4()}-${new Date().getTime()}-${uuidv4()}`
    }


}
