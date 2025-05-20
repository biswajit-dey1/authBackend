import User from "../models/user.model.js";
import crypto from "crypto";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { emailVerificationMailGenContent, sendMail } from "../Utility/mail.js";

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({
            message: "All field are required",
            success: false,
        });
    }

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (regex.test(email) !== true) {
        return res.status(400).json({
            message: "Invalid email",
            success: false,
        });
    }

    try {
        const existedUser = await User.findOne({
            email,
        });

        if (existedUser) {
            res.status(400).json({
                message: "User with email or username already exists",
                succes: false,
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });
        if (!user) {
            res.status(400).json({
                message: "Error in creating user",
                succes: false,
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.VerificationToken = token;
        await user.save();
        const verificationlink = `${process.env.BASE_URL}/api/v1/user/verify/${token}`;

        sendMail({
            email: user.email,
            subject: "Verify your account",
            mailGenContent: emailVerificationMailGenContent(
                name,
                verificationlink
            )
        })


        res.status(200).json({
            message: "User register succesfully and check your email to verify",
            user,
            succes: "true",
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server error",
            error,
            succes: false,
        });
    }
};

const verifyUser = async (req, res) => {
    const { token } = req.params;

    try {
        if (!token) {
            res.status(400).json({
                message: "Token not found",
                succes: false,
            });
        }

        const user = await User.findOne({
            VerificationToken: token,
        });

        if (!user) {
            res.status(400).json({
                message: "Invalid token, user not found",
                succes: false,
            });
        }

        user.isVerified = true;
        user.VerificationToken = undefined;
        await user.save();

        res.status(200).json({
            message: "User verified Succesfully ",
            succes: true,
        });
    } catch (error) {
        res.status(400).json({
            message: "Internal server error",
            succes: true,
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            message: "Both field are required",
            succes: false,
        });
    }

    try {
        const user = await User.findOne({
            email,

        });

        if (!user) {
            res.status(400).json({
                message: "User not found",
                succes: false,
            });
        }
        console.log(user);
        if (!user.isVerified) {
            return res.status(403).json({
                message: "Your account is not verified. Please verify your email before logging in.",
                success: false,
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const accessToken = await jwt.sign(
            { id: user._id, role: user.role },
            process.env.ACCESSTOKEN_SECRET,
            {
                expiresIn: "2m",
            }
        );

        const refreshToken = await jwt.sign(
            { id: user._id, role: user.role },
            process.env.REFRESHTOKEN_SECRET,
            {
                expiresIn: "1D",
            }
        );
         
        console.log(accessToken);

        console.log(refreshToken)

       
        user.refreshToken = refreshToken

        await user.save()
        const option = {
            httpOnly: true,
            // secure: true,
            // maxAge: 24 * 60 * 60 * 1000,
        };

        res.cookie("accesToken", accessToken, option);

        res.cookie("refreshToken", refreshToken, option);


        return res.status(200).json({
            message: "User logged in succesfully",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
            },
            refreshToken,
            success: true,
        });
    } catch (error) {
        console.error("User login failed", error);
        res.status(500).json({
            message: "Internal Server error in login",
            error,
            succes: false,
        });
    }
};

const logoutUser = async (req, res) => {

       try {
         const user = await User.findById(req.user.id)
         console.log(user)
         
         if (!user) {
             res.status(400).json({
                 message: "User not found",
                 succes: false,
             });
         }
        
         res.cookie("accesToken","", {})
         res.cookie("refreshToken","",{})

        // newly added
         user.refreshToken = null
         await user.save()
 
         return res.status(200).json({
             message: "User logged out succesfully",
             success: true,
         });
       } catch (error) {
          res.status(500)
          .json({
            "message":"Internal server error while logging out",
            "succes":false

          })
       }
    } 
   
const refreshhedRefreshToken = async () =>{

    
}

export { registerUser, verifyUser, loginUser, logoutUser };
