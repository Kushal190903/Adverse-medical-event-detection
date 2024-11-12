import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
const { genSalt, hash, compare } = bcrypt;
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(json());
app.use(cors());

// MongoDB connection
connect(process.env.URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// User Schema remains the same as before
const userSchema = new Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    minLength: [3, 'Username must be at least 3 characters long'],
    maxLength: [30, 'Username cannot exceed 30 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters long']
  },
  profile: {
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [18, 'Age must be at least 18'],
      max: [120, 'Age cannot exceed 120']
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [20, 'Weight must be at least 20 kg'],
      max: [300, 'Weight cannot exceed 300 kg']
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female'],
        message: 'Gender must be either male or female'
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = model('User', userSchema);

// Signup route remains the same...
// Signup route
app.post('/api/signup', async (req, res) => {
    try {
      const { username, email, password, profile } = req.body;
  
      // Check if all required fields are provided
      if (!username || !email || !password || !profile) {
        return res.status(400).json({ message: 'Please provide all required fields' });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
  
      // Hash the password
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
  
      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        profile,
      });
  
      // Save the new user to the database
      await newUser.save();
  
      // Send a response with the user details excluding the password
      res.status(201).json({
        message: 'User created successfully',
      });
  
    } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Updated login route with MongoDB ObjectId in response
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Account is not active' 
      });
    }

    // Validate password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const token = sign(
      { userId: user._id },
      process.env.JWT_KEY,
      { expiresIn: '24h' }
    );

    // Return response with MongoDB ObjectId
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id, // MongoDB ObjectId
        id: user._id.toString(), // String version of ObjectId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login' 
    });
  }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied' 
      });
    }
  
    verify(token, process.env.JWT_KEY , (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          message: 'Invalid token' 
        });
      }
      req.user = decoded;
      next();
    });
  };

app.get('/api/info', authenticateToken, async (req, res) => {
    try {
      // Retrieve user information based on the decoded userId from the token
      const user = await User.findById(req.user.userId).select('username profile');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Respond with the user info (you can include more fields as needed)
      res.json({
        username: user.username,
        age: user.profile.age,
        weight: user.profile.weight,
        gender: user.profile.gender
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: 'Server error fetching user info' });
    }
  });

// Authentication middleware


// Protected profile route
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    res.json({
      ...user.toObject(),
      _id: user._id // Explicitly include MongoDB ObjectId
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});