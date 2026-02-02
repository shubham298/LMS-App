import express from "express";
import User from "../models/User.js";
import Session from "../models/Session.js";
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Generate session
    let session;
    if (req.cookies.sid) {
      session = await Session.findById(req.cookies.sid);
      session.userId = user._id;
      await session.save();
    } else {
      session = await Session.create({ cart: [], userId: user._id });
      await session.save();
    }
    res.cookie("sid", session.id, {
      maxAge: 60 * 60 * 1000 * 24, // 1 day
      httpOnly: true,
      signed: true
    });
    res.json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

// // Get user profile
// router.get("/profile", async (req, res) => {
//   try {
//     const user = await User.findById(req.body.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found", success: false });
//     }
//     res.json({
//       user: {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message, success: false });
//   }
// });

// Logout user
router.post("/logout", (req, res) => {
  res.clearCookie("sid");
  res.status(200).json({ message: "Logout successful", success: true });
});

export default router;


