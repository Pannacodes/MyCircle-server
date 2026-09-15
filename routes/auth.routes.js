const router = require("express").Router();

const User = require("../models/User.model");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { verifyToken } = require("../middlewares/auth.middlewares");

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Checks required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required.",
      });
    }

    // Password strength
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

    if (passwordRegex.test(password) === false) {
      return res.status(400).json({
        errorMessage:
          "Password not strong enough. Needs at least 8 characters, one uppercase, one lowercase and one number.",
        field: "password",
      });
    }

    // Checks whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered.",
      });
    }

    // Hashes password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Creates user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Doesn't send the password back
    res.status(201).json({
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // Checks required fields
  if (!email || !password) {
    return res.status(400).json({
      errorMessage: "Both email and password are mandatory",
    });
  }

  try {
    // Finds user by email
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(400).json({
        errorMessage: "User not found",
      });
    }

    // Compares the password with the hashed password in the database
    const passwordCorrect = await bcrypt.compare(password, foundUser.password);

    if (!passwordCorrect) {
      return res.status(400).json({
        errorMessage: "Invalid password",
      });
    }

    // Generates JWT
    const payload = {
      _id: foundUser._id,
      email: foundUser.email,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      authToken,
      payload,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/verify", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id);
    res.status(200).json({
      payload: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
