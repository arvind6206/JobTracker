import { Router } from "express";
import { userModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";
import { jobModel } from "../models/job.model.js";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "All fields are necessary",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        msg: "User already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(200).json({
      msg: "user created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      msg: "Internal srever error",
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      return res.json({
        msg: "User data doesn't exist first signup",
      });
    }

    const matched = await bcrypt.compare(password, foundUser.password);
    if (!matched) {
      return res.status(400).json({
        msg: "Incorrect Password",
      });
    }
    const token = jwt.sign(
      {
        _id: foundUser.id,
      },
      process.env.JWT_SECRET,
    );
    res.json({
      msg: "Login successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: "Internal server error",
    });
  }
});

userRouter.post("/job-apply", authMiddleware, async (req, res) => {
  try {
    const { company, position, salary, status, interviewDate, notes } =
      req.body;

    if (!company || !position) {
      return res.status(404).json({
        msg: "These fileds are required",
      });
    }

    const job = await jobModel.create({
      user: req.userId,
      company,
      position,
      salary,
      status,
      interviewDate,
      notes,
    });
    res.status(200).json({
      success: true,
      msg: "job application added successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

userRouter.get("/jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await jobModel.find({
      user: req.userId,
    });
    res.json({
      jobs: jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

userRouter.get("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const jobs = await jobModel.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    res.json({
      jobs: jobs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

userRouter.put("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

    const { company, position, salary, status, interviewDate, notes } =
      req.body;

    const job = await jobModel.findOne({
      _id: jobId,
      user: req.userId,
    });

    if (!job) {
      return res.status(404).json({
        msg: "Job not found",
      });
    }

    job.company = company ?? job.company;
    job.position = position ?? job.position;
    job.salary = salary ?? job.salary;
    job.status = status ?? job.status;
    job.interviewDate = interviewDate ?? job.interviewDate;
    job.notes = notes ?? job.notes;

    await job.save();

    return res.status(200).json({
      msg: "Job updated successfully",
      job,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      msg: "Internal server error",
    });
  }
});

userRouter.delete("/jobs/:id", authMiddleware, async (req, res) => {
  try {
    const jobId = req.params.id;

    const deletedJob = await jobModel.findOneAndDelete({
      _id: jobId,
      user: req.userId,
    });

    if (!deletedJob) {
      return res.status(404).json({
        msg: "Job not found",
      });
    }

    return res.status(200).json({
      msg: "Job deleted successfully",
    });
  } catch (error) {
    console.log(error)
    res.status.json({
        msg: "Internal server error"
    })
  }
});

export default userRouter;
