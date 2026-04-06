const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const app = express();
app.use(express.json());
app.use(express.static("public"));

const SECRET = process.env.SECRET;

// connect MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// MODEL
const User = mongoose.model("User", {
  name: String,
  age: Number,
  email: { type: String, unique: true },
  pswd: String
});



// 🔐 AUTH MIDDLEWARE (define BEFORE using)
function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.send("Invalid token");
  }
}


// ➕ REGISTER
app.post("/add", async (req, res) => {
  try {
    const { name, age, email, pswd } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("Email already registered!");
    }

    const hashedPassword = await bcrypt.hash(pswd, 10);

    const user = new User({
      name,
      age,
      email,
      pswd: hashedPassword
    });

    await user.save();
    res.json({ message: "Saved securely" });
  } catch (err) {
    res.send("Error saving user");
  }
});


// 🔐 LOGIN
app.post("/login", async (req, res) => {
  const { email, pswd } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });

  const isMatch = await bcrypt.compare(pswd, user.pswd);
  if (!isMatch) return res.json({ message: "Wrong password" });

  const token = jwt.sign({ email: user.email }, SECRET);

  res.cookie("token", token, {
  httpOnly: true,
  secure: true, // keep true on Render (HTTPS)
  sameSite: "strict"
});


//LOGOUT ROUT
app.post("/logout" , (req, res) => {
    res.clearCookies("token");
    res.send("Logged out");
});



res.json({ message: "Login successful" });
});


// 🔁 RESET PASSWORD (basic version)
app.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.pswd = hashedPassword;
  await user.save();

  res.send("Password updated!");
});


// 👤 GET USERS (PROTECTED)
app.get("/users", auth, async (req, res) => {
  const users = await User.find().select("-pswd");
  res.json(users);
});


// ❌ DELETE USER
app.delete("/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("Deleted!");
});


// 🧨 DELETE ACCOUNT (SECURE)
app.delete("/delete-account", auth, async (req, res) => {
  const email = req.user.email;

  await User.findOneAndDelete({ email });

  res.send("Account deleted!");
});


// 🚀 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));