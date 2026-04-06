const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARE (correct order)
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true
}));

const SECRET = process.env.SECRET;

// ✅ CONNECT DATABASE
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ MODEL
const User = mongoose.model("User", {
  name: String,
  age: Number,
  email: { type: String, unique: true },
  pswd: String
});

// 🔐 AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

// ➕ REGISTER
app.post("/add", async (req, res) => {
  try {
    const { name, age, email, pswd } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered!" });
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
    res.json({ message: "Error saving user" });
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
    secure: true,       // ✅ required for Render (HTTPS)
    sameSite: "strict"
  });

  res.json({ message: "Login successful" });
});

// 🚪 LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Logged out");
});

// 🔁 RESET PASSWORD
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