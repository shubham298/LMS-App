import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  //Add your code here
  if (req.signedCookies.sid) {
    const session = await Session.findById(req.signedCookies.sid);
    res.status(200).json({
      message: "Cart fetched from session",
      cart: session ? (session.data.cart || []) : []
    });
  } else {
    res.status(200).json({ message: "No session found", cart: [] });
  }
});

// Add to cart
router.post("/", async (req, res) => {
  try {
    const { cartItems } = req.body;
    if (req.signedCookies.sid) {
      const session = await Session.findById(req.signedCookies.sid);

      const existingCart = session.data.cart || [];
      const incomingItems = Array.isArray(cartItems) ? cartItems : [cartItems];

      const updatedCart = [...existingCart];
      incomingItems.forEach((newItem) => {
        const index = updatedCart.findIndex(
          (item) => item.name === newItem.name
        );
        if (index > -1) {
          //update quantity of existing item
          updatedCart[index].quantity =
            (updatedCart[index].quantity || 0) + (newItem.quantity || 1);
        } else {
          //add new item in the existing cart
          updatedCart.push({ ...newItem, quantity: newItem.quantity || 1 });
        }
      });

      session.data = { ...session.data, cart: updatedCart };
      session.markModified("data");
      await session.save();

      res.status(200).json({ message: "Cart updated in session", cart: session.data.cart });
    } else {
      const session = new Session({ data: { cart: cartItems } });
      await session.save();
      console.log("===>")
      console.log("NEW SESSION", JSON.stringify(session.data));
      res.cookie("sid", session.id, {
        httpOnly: true,
        signed: true,
        maxAge: 1000 * 60 * 60, // 1 hour
      });
      res.status(200).json({ message: "Cart updated in session", cart: session.data.cart });
    }
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// Remove course from cart
router.delete("/:courseName", async (req, res) => {
  try {
    const { courseName } = req.params;
    if (req.signedCookies.sid) {
      const session = await Session.findById(req.signedCookies.sid);
      if (session && session.data.cart) {
        const itemIndex = session.data.cart.findIndex(
          (item) => item.name === courseName
        );

        if (itemIndex > -1) {
          if (session.data.cart[itemIndex].quantity > 1) {
            session.data.cart[itemIndex].quantity -= 1;
          } else {
            session.data.cart.splice(itemIndex, 1);
          }
          session.markModified("data");
          await session.save();
        }
      }
      res.status(200).json({ message: "Item removed from cart", cart: session.data.cart });
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
