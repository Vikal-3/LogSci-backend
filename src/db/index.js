import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);


import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const ConnectDB = async () => {
      try {
            const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            console.log(`\n MONGODB connecteed !!....DB:HOST: ${connectInstance.connection.host}`)
      } catch (error) {
            console.log(" MONGODB Connection Failed ....", error);
            process.exit(1);
      }

}

export default ConnectDB;




