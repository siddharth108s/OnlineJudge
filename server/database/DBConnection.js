import mongoose from "mongoose";

export default async DBConnect => {
    await mongoose.connect(process.env.URI)
}

// export default async function DBConnect(retries = 5, interval = 5000) {
//     for (let i = 0; i < retries; i++) {
//         try {
//             await mongoose.connect(process.env.URI);
//             return true;
//         } catch (error) {
//             if (i === retries - 1) {
//                 throw new Error(`Failed to connect to MongoDB after ${retries} attempts: ${error.message}`);
//             }
//             console.log(`Connection attempt ${i + 1} failed. Retrying in ${interval/1000} seconds...`);
//             await new Promise(resolve => setTimeout(resolve, interval));
//         }
//     }
// }