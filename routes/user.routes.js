import {Router} from 'express'
import { userModel } from '../models/user.model.js'
import bcrypt from 'bcryptjs'

const userRouter = Router()

userRouter.post('/signup', async(req, res) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password){
            res.status(400).json({
                msg: "All fields are necessary"
            })
        }

        const existingUser = await userModel.findOne({email})
        if(existingUser){
            res.json({
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

export default userRouter