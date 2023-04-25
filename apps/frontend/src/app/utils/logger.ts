

export default class Log {


    public static info(msg: string) {
        if (process.env["NODE_ENV"] === 'development') {
            console.info(msg);
        }
    }


    public static error(err: string) {
        if (process.env["NODE_ENV"] === 'development') {
            console.error(err);
        }
    }


    public static warn(msg: string) {
        if (process.env["NODE_ENV"] === 'development') {
            console.warn(msg);
        }
    }


}





