import dotenv from 'dotenv';
import path from "path";

export function dotenvConfig(){
    let envFile = '.env'
    if(process.env.NODE_ENV == 'testing'){
        envFile = `.env.test`;
    }
    
    console.log(`Using envFile = ${envFile}`)

    dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}
