import {Router} from 'express'
import { userModel } from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authMiddleware from '../middleware/auth.js'
import { jobModel } from '../models/job.model.js'

const userRouter = Router()

userRouter.post('/signup', async(req, res) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password){
           return res.status(400).json({
                msg: "All fields are necessary"
            })
        }

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({
                msg: "User already exist"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 5)

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        })
        res.status(200).json({
            msg: "user created successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(404).json({
            msg: "Internal srever error"
        })
        
    }
})

userRouter.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body
        const foundUser = await userModel.findOne({email})
        if(!foundUser){
           return res.json({
                msg: "User data doesn't exist first signup"
            })
        }

        const matched = await bcrypt.compare(password, foundUser.password)
        if(!matched){
           return res.status(400).json({
                msg: "Incorrect Password"
            })
        }
        const token = jwt.sign({
            _id: foundUser.id
        }, process.env.JWT_SECRET)
        res.json({
            msg: "Login successfully",
            token: token
        })
    } catch (error) {
        console.log(error)
        res.json({
            msg: "Internal server error"
        })
    }
})

userRouter.post(
    '/job-apply', authMiddleware, async(req, res) => {
    try {
        const {company, position, salary, status, interviewDate, notes} = req.body

        if(!company || !position){
            return res.status(404).json({
                msg: "These fileds are required"
            })
        }

        const job = await jobModel.create({
            user: req.userId,
            company, 
            position, 
            salary, 
            status, 
            interviewDate, 
            notes
        })
        res.status(200).json({
            success: true,
            msg: "job application added successfully",
            job
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})

userRouter.get('/jobs', authMiddleware, async(req, res) => {
    try {
        const jobs = await jobModel.find({
            user: req.userId
        })
        res.json({
            jobs: jobs
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})

userRouter.get('/jobs/:id', authMiddleware, async(req, res) => {
    try {
        const jobs = await jobModel.findOne({
            _id: req.params.id,
            user: req.userId
        })
        res.json({
            jobs: jobs
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})



export default userRouter