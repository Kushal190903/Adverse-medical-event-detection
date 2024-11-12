import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState({
    age: 0,
    gender: '',
    weight: 0,
    username: ''
  });
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState({
    drugName: '',
    rechallenge: '',
    dechallanged: '',
    symptoms: '',
    diseaseName: ''
  });
  const [formVisible, setFormVisible] = useState(false);

  const [drugSuggestions, setDrugSuggestions] = useState([]);
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);
  const [diseaseSuggestions, setDiseaseSuggestions] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('Id'); // or another key where you store the userId
const token = localStorage.getItem('token'); // assuming the token is stored under the key 'token'

// Check if userId and token exist in localStorage before sending the request
if (userId && token) {
  fetch('http://localhost:5000/api/info', {
    method: 'GET', // Assuming GET method, change if you're using POST
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
      'user-id': userId // Optionally include the userId in the headers
    }
  })
    .then(response => response.json())
    .then(data => setPatientInfo(data))
    .catch(error => console.error('Error fetching patient info:', error));
} else {
  navigate('/login');
  alert('Login first!');
}

    fetch('/api/patientQueries')
      .then(response => response.json())
      .then(data => setQueries(data))
      .catch(error => console.error('Error fetching patient queries:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuery({ ...newQuery, [name]: value });

    if (name === 'drugName') fetchSuggestions(value, 'drugs', setDrugSuggestions);
    if (name === 'symptoms') fetchSuggestions(value, 'symptoms', setSymptomSuggestions);
    if (name === 'diseaseName') fetchSuggestions(value, 'diseases', setDiseaseSuggestions);
  };

  const fetchSuggestions = (query, type, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    fetch(`/api/search/${type}?q=${query}`)
      .then(response => response.json())
      .then(data => setSuggestions(data))
      .catch(error => console.error(`Error fetching ${type} suggestions:`, error));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...newQuery, ...patientInfo };

    try {
      const response = await fetch('/api/addQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      const newQueryData = await response.json();
      setQueries([...queries, newQueryData]);
      setNewQuery({
        drugName: '',
        rechallenge: '',
        dechallanged: '',
        symptoms: '',
        diseaseName: ''
      });
      setFormVisible(false);
    } catch (error) {
      console.error('Error submitting query:', error);
    }
  };

  return (
    <div className="container mx-auto my-8 p-4 md:p-8 bg-gray-50 max-h-screen">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-xl p-6 mb-10 transform transition duration-500 hover:scale-105">
        <h2 className="text-4xl font-semibold mb-6">Patient Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-lg"><strong>Name:</strong> {patientInfo.username}</p>
            <p className="text-lg"><strong>Age:</strong> {patientInfo.age}</p>
            <p className="text-lg"><strong>gender:</strong> {patientInfo.gender}</p>
            <p className="text-lg"><strong>Weight:</strong> {patientInfo.weight}</p>
          </div>
          <div className="flex justify-end items-center">
            <button
              className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full shadow-md transform transition duration-300 hover:scale-110 hover:bg-gray-100"
              onClick={() => setFormVisible(true)}
            >
              + Add New Query
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Previous Queries</h2>
        <ul className="space-y-6">
          {queries.map((query, index) => (
            <li key={index} className="bg-gray-100 p-5 rounded-lg shadow-sm transition transform hover:scale-105">
              <p className="text-lg"><strong>Drug Name:</strong> {query.drugName}</p>
              <p className="text-lg"><strong>Rechallenge:</strong> {query.rechallenge}</p>
              <p className="text-lg"><strong>Dechallanged:</strong> {query.dechallanged}</p>
              <p className="text-lg"><strong>Symptoms:</strong> {query.symptoms}</p>
              <p className="text-lg"><strong>Disease Name:</strong> {query.diseaseName}</p>
            </li>
          ))}
        </ul>
      </div>

      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg transition-transform transform scale-105">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Query</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-6">
                <label htmlFor="drugName" className="block font-medium text-gray-600 mb-2">Drug Name:</label>
                <div className="relative">
                  <input
                    type="text"
                    id="drugName"
                    name="drugName"
                    value={newQuery.drugName}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {drugSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 rounded-lg p-2 w-full z-10 shadow-lg space-y-2">
                      {drugSuggestions.map((drug, index) => (
                        <li
                          key={index}
                          className="hover:bg-indigo-100 cursor-pointer p-2 rounded-md"
                          onClick={() => setNewQuery({ ...newQuery, drugName: drug.name })}
                        >
                          {drug.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="rechallenge" className="block font-medium text-gray-600 mb-2">Rechallenge:</label>
                <select
                  id="rechallenge"
                  name="rechallenge"
                  value={newQuery.rechallenge}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Rechallenge Option</option>
                  <option value="P">P: The symptoms partially returned on reuse</option>
                  <option value="U">U: Unknown</option>
                  <option value="N">N: The symptoms did not return upon reintroduction</option>
                  <option value="D">D: The symptoms returned on medicine</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="dechallanged" className="block font-medium text-gray-600 mb-2">Dechallanged:</label>
                <select
                  id="dechallanged"
                  name="dechallanged"
                  value={newQuery.dechallanged}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Dechallanged Option</option>
                  <option value="P">P: The symptoms partially improved when the drug was stopped</option>
                  <option value="U">U: Unknown</option>
                  <option value="D">D: The symptoms disappeared when the drug was stopped</option>
                  <option value="N">N: The symptoms continued when the drug was stopped</option>
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="symptoms" className="block font-medium text-gray-600 mb-2">Disease:</label>
                <input
                  type="text"
                  id="symptoms"
                  name="symptoms"
                  value={newQuery.symptoms}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-3 w-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg ml-4 transition-transform transform hover:scale-105"
                  onClick={() => setFormVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;