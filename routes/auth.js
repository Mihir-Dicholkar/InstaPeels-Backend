import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
const app = express();


router.post('/register', async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    console.log("Received registration data:", { name, email }); // ✅

    const hashed = await bcrypt.hash(password, 10);
    const isAdmin = email ==="admin@instapeels.com"
    const user = new User({ name, email, mobile, password: hashed, isAdmin });
    await user.save();

    console.log("User saved to MongoDB:", user); // ✅

    res.status(201).send("User registered");
  } catch (err) {
    console.error("Registration error:", err);
   if (err.code === 11000) {
    return res.status(409).json({message: 'An account with this email has already exist '})
   }
   res.status(500).json({message: 'Registration failed.Please try again'})
  }
});

router.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: 'Invalid mobile number' });
  }

  let user = await User.findOne({ mobile });

  if (!user) {
    user = new User({ mobile }); // Temporary user if not registered yet
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

  user.otp = { code: otpCode, expiresAt: expiry };
  await user.save();

  console.log(`🔐 OTP sent to ${mobile}: ${otpCode}`);
res.json({ message: 'OTP sent successfully', otp: otpCode }); 
});

router.post('/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile });

  if (!user || !user.otp) {
    return res.status(400).json({ message: 'OTP not found' });
  }

  const { code, expiresAt } = user.otp;

  if (code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (new Date() > expiresAt) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  user.otp = undefined;
  await user.save();

  res.json({ message: 'OTP verified successfully' });
});




router.post("/login", async (req, res) => {
  console.log("Recived login requeust:", req.body);
  const {email, password} = req.body
  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Incorrect password");
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log("Login successful", {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });

    return res.status(200).json({
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
