import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        
    },

    gender: {
        type: String,
      
    },

    collegeName: {
        type: String,
     
    },

    hostelName: {
        type: String,

    },

    email: {
        type: String,
        
    },

    phoneNo: {
        type: Number,
       
    },

    userName: {
        type: String,
        unique: true
    },
     otp: {
    type: String,
    select: false,
  },

  otpExpiry: {
    type: Date,
    select: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  isProfileComplete: {
  type: Boolean,
  default: false
}

},{timestamps : true})

export default mongoose.model("User",userSchema);