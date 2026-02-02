import express from "express";
import mongoose from "mongoose";
import Session from "../models/Session.js";
import Course from "../models/Course.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  try {
    const sid = req.signedCookies.sid;
    if (sid) {
      const session = await Session.findById(sid);

      if (!session || !session.data || !session.data.cart || session.data.cart.length === 0) {
        return res.status(200).json({ message: "Cart is empty", cart: [] });
      }

      const courseIds = session.data.cart.map((item) => item.courseId);
      const courses = await Course.find({ _id: { $in: courseIds } });

      const cartCourses = courses.map((course) => {
        const { _id, image, name, price } = course;
        const { quantity } = session.data.cart.find((item) => item.courseId.toString() === course._id.toString());
        return {
          courseId: _id,
          image: image,
          name: name,
          price: price,
          quantity: quantity,
        };
      });

      res.status(200).json({
        message: "Cart fetched from session",
        cart: cartCourses,
      });
    } else {
      res.status(200).json({ message: "No session found", cart: [] });
    }
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add to cart
router.post("/", async (req, res) => {
  try {
    const { courseId } = req.body;
    const sid = req.signedCookies.sid;

    if (sid) {
      // Find item in cart and increment quantity if found
      const result = await Session.updateOne(
        { _id: sid, "data.cart.courseId": courseId },
        { $inc: { "data.cart.$.quantity": 1 } }
      );

      if (result.matchedCount > 0) {
        const session = await Session.findById(sid);
        return res.status(200).json({
          message: "Cart item quantity incremented",
          cart: session ? (session.data.cart || []) : [],
        });
      }

      // If item not found in cart, add it
      await Session.updateOne(
        { _id: sid },
        {
          $push: {
            "data.cart": {
              courseId: courseId,
              quantity: 1,
            },
          },
        }
      );

      const updatedSession = await Session.findById(sid);
      res.status(200).json({
        message: "Item added to cart",
        cart: updatedSession ? (updatedSession.data.cart || []) : [],
      });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const sid = req.signedCookies.sid;

    if (sid) {
      // Try to decrement quantity if > 1
      const result = await Session.updateOne(
        {
          _id: sid,
          "data.cart": { $elemMatch: { courseId: courseId, quantity: { $gt: 1 } } },
        },
        { $inc: { "data.cart.$.quantity": -1 } }
      );

      // If no item was decremented, it means quantity was 1 or item doesn't exist.
      // So we pull the item from the cart array.
      if (result.modifiedCount === 0) {
        await Session.updateOne(
          { _id: sid },
          { $pull: { "data.cart": { courseId: courseId } } }
        );
      }

      const session = await Session.findById(sid);
      res.status(200).json({
        message: "Cart updated",
        cart: session ? (session.data.cart || []) : [],
      });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;
