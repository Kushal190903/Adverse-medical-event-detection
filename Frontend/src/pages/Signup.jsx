import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    weight: '',
    gender: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      newErrors.age = 'Age must be between 18 and 120';
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (parseInt(formData.weight) < 20 || parseInt(formData.weight) > 300) {
      newErrors.weight = 'Please enter a valid weight between 20 and 300 kg';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:5000/api/signup', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          // Additional user data
          profile: {
            age: formData.age,
            weight: formData.weight,
            gender: formData.gender
          }
        });

        localStorage.setItem('token', response.data.token);
        alert('Registration successful!');
        navigate('/login');

      } catch (error) {
        console.error('Signup error:', error);
        setApiError(
          error.response?.data?.message || 
          'An error occurred during registration. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-2 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 1), rgba(122, 122, 122, 0)), url('https://asianheartinstitute.org/wp-content/uploads/2023/12/home-banner-mob.webp')`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-5 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600">Registration</h2>
          <p className="text-gray-600 mt-2">Please fill in your details below</p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              1. Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              placeholder="Choose a username"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              2. Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              3. Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your age"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              4. Weight (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your weight in kg"
            />
            {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              5. Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-left">
              6. Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md mt-8 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;