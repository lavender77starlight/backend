const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getDB } = require("../db");

function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || "astrotrainer-key",
    { expiresIn: "30d" }
  );
}

// Register a new astronaut user
async function registerUser(username, password) {
  const db = getDB();
  const usersCollection = db.collection("users");

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ username });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password with bcrypt
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert new user into MongoDB
  const result = await usersCollection.insertOne({
    username,
    password: hashedPassword,
    createdAt: new Date()
  });

  const token = generateToken({ _id: result.insertedId, username });

  return {
    success: true,
    message: "Signup successful",
    userId: result.insertedId,
    username,
    token
  };
}

// Authenticate an existing astronaut user
async function loginUser(username, password) {
  const db = getDB();
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }

  // Compare submitted password with stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid username or password");
  }

  const token = generateToken(user);

  return {
    success: true,
    message: "Login successful",
    userId: user._id,
    username: user.username,
    token
  };
}

module.exports = { registerUser, loginUser };