import express from "express";
import Course from "../models/Course.js";
import Session from "../models/Session.js";

const router = express.Router();

// GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();

    // Find session or create new
    if (!req.signedCookies.sid) {
      const session = await Session.create({ cart: [] });
      // Set session cookie with 15 minutes expiration
      res.cookie("sid", session.id, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        signed: true
      });
    }

    res.json(courses);
  } catch (error) {
    console.error("Error in courses route:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
