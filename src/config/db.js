import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL || '',)
        console.log(`MongoDB Connected Successfully`)
    } catch (error) {
        console.error(error.message)
        process.exit(1)
    }
}