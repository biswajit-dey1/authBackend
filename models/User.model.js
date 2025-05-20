import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        password: String,
        isVerified:{
            type:Boolean,
            default:false
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default:"user"
        },

        VerificationToken: String,
 
        refreshToken: String
    },
    {timestamps:true}
);

userSchema.pre('save', async function(next){
    // console.log(this)
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password,10);
  }
  next()
})
const User = mongoose.model("User", userSchema)

export default User