import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (reg, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = reg.body;
    // console.log( fullname, email, phoneNumber, password, role) // check data 
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        message: "Something is Missing",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exit with this email.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashPassword,
      role,
    });

    return res.status(201).json({
      message: "Account Create Successfully",
      success: true,
    });
  } catch (error) {
    console.log("Request Body:", req.body);
  }
};

export const login = async (reg, res) => {
  try {
    const { email, password, role } = reg.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Something is missing ",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Username and Password.",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid Username and Password.",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    const tokeData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokeData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httsOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true
      })
  } catch (error) {
      console.log(error);
  }
}

export const updateProfile = async (reg, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = reg.body;

    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = reg.id;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    //updating data
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;


    // user.fullname = fullname || user.fullname;
    // user.email = email || user.email;
    // user.phoneNumber = phoneNumber || user.phoneNumber;
    // user.profile.bio = bio || user.profile.bio;
    // user.profile.skills = skillsArray || user.profile.skills;

    // resume comes letter here

    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      eamil: user.email,
      phoneNumber: user.phoneno,
      role: user.role.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "profile update successfully.",
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
