const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/imperium")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Imperium Backend Running");
});

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ username });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists"
      });
    }

    const user = new User({
      username,
      email,
      password,
      balance: 1000
    });

    await user.save();

    res.json({
      success: true,
      message: "Account created"
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.json({
        success: false,
        message: "Wrong login"
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

/* BALANCE */
app.get("/balance/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({
    balance: user ? user.balance : 0
  });
});

/* BET */
app.post("/bet", async (req, res) => {
  const { userId, amount } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.json({ success: false });
  }

  if (user.balance < amount) {
    return res.json({
      success: false,
      message: "Not enough balance"
    });
  }

  user.balance -= Number(amount);
  await user.save();

  res.json({
    success: true,
    balance: user.balance
  });
});

/* WIN */
app.post("/win", async (req, res) => {
  const { userId, amount } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.json({ success: false });
  }

  user.balance += Number(amount);
  await user.save();

  res.json({
    success: true,
    balance: user.balance
  });
});

/* ADMIN ADD */
app.post("/admin/add-balance", async (req, res) => {
  if (req.headers["admin-password"] !== "1234") {
    return res.json({
      success: false,
      message: "Unauthorized"
    });
  }

  const { userId, amount } = req.body;

  await User.findByIdAndUpdate(userId, {
    $inc: { balance: Number(amount) }
  });

  res.json({ success: true });
});

/* ADMIN REMOVE */
app.post("/admin/remove-balance", async (req, res) => {
  if (req.headers["admin-password"] !== "1234") {
    return res.json({
      success: false,
      message: "Unauthorized"
    });
  }

  const { userId, amount } = req.body;

  await User.findByIdAndUpdate(userId, {
    $inc: { balance: -Number(amount) }
  });

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("SERVER RUNNING " + PORT);
});