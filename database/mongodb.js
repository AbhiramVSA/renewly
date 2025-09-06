import mongoose from 'mongoose';

import {DB_URI, NODE_ENV} from "../config/env.js";

const connectToDatabase = async () => {
    try {
        if(!DB_URI) {
            throw new Error("MongoDB URI is missing");
        }
        await mongoose.connect(DB_URI);
        console.log(`Connected to Database in ${NODE_ENV} mode`);
    } catch(error) {
        console.error('Cannot connect to database: ', error);
        // Do not exit the process; app will continue running
    }
}

export default connectToDatabase;