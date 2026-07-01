import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRouter from './routes/user.routes.js'

dotenv.config()

const app = express()

app.use(express.json())

app.use('/api/v1/user', userRouter)

async function main(){
    const PORT = process.env.PORT || 3000
    await mongoose.connect(process.env.MONGO_URI)
    console.log(`Server listening on http://localhost:${PORT}`)
}
main()