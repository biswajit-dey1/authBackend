import express from "express"
import {loginUser, logoutUser, registerUser, verifyUser, } from "../controllers/user.controller.js"
import isLoggedIn from "../middleware/auth.middleware.js"

const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.get("/verify/:token", verifyUser)
userRoute.post("/login",loginUser)
userRoute.get("/logout",isLoggedIn,logoutUser)

export default userRoute

