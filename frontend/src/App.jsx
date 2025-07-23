import { useState } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import './App.css';

function App() {
  const branches = [
    "Civil Engineering (CE)",
    "Electrical & Electronics Engineering (EEE)",
    "Mechanical Engineering (ME)",
    "Electronics & Communication Engineering (ECE)",
    "Computer Science & Engineering (CSE)",
    "Computer Science & Engineering - AI & ML (CSM)",
    "Computer Science & Engineering - Data Science (CSD)"
  ];

  const [formData, setFormData] = useState({
    name: '',
    photo: null,
    fatherName: '',
    address: '',
    mobile: '',
    resident: '',
    board12th: '',
    maxMarks12th: '',
    marksObtained12th: '',
    percentage12th: '',
    memo12th: null,
    jeeRank: '',
    eapcetRank: '',
    board10th: '',
    maxMarks10th: '',
    marksObtained10th: '',
    gpa10th: '',
    memo10th: null,
    priorities: Array(7).fill(''),
    eapcetHallTicket: null,
    eapcetRankCard: null,
    jeeHallTicket: null,
    jeeRankCard: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e, field, index = null) => {
    setErrors({ ...errors, [field]: '' });
    if (index !== null) {
      const newPriorities = [...formData.priorities];
      newPriorities[index] = e.target.value;
      setFormData({ ...formData, priorities: newPriorities });
    } else if (e.target.type === 'file') {
      const file = e.target.files[0];
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          setErrors({ ...errors, [field]: `Invalid file type for ${field}. Only JPEG, PNG, and PDF allowed.` });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, [field]: `File size for ${field} exceeds 5MB limit.` });
          return;
        }
      }
      setFormData({ ...formData, [field]: file });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      photo: null,
      fatherName: '',
      address: '',
      mobile: '',
      resident: '',
      board12th: '',
      maxMarks12th: '',
      marksObtained12th: '',
      percentage12th: '',
      memo12th: null,
      jeeRank: '',
      eapcetRank: '',
      board10th: '',
      maxMarks10th: '',
      marksObtained10th: '',
      gpa10th: '',
      memo10th: null,
      priorities: Array(7).fill(''),
      eapcetHallTicket: null,
      eapcetRankCard: null,
      jeeHallTicket: null,
      jeeRankCard: null
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['name', 'fatherName', 'address', 'mobile', 'resident', 'board12th', 'maxMarks12th', 'marksObtained12th', 'percentage12th', 'memo12th'];
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
    });

    const numericFields = ['maxMarks12th', 'marksObtained12th', 'percentage12th'];
    ['jeeRank', 'eapcetRank', 'maxMarks10th', 'marksObtained10th', 'gpa10th'].forEach(field => {
      if (formData[field]) numericFields.push(field);
    });

    numericFields.forEach(field => {
      if (formData[field] && isNaN(Number(formData[field]))) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} must be a number`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'priorities') {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] instanceof File) {
        data.append(key, formData[key]);
      } else if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        alert('Form submitted successfully!');
        resetForm();
      } else {
        alert(`Error submitting form: ${result.message || 'Unknown server error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error submitting form: ${error.message || 'Network error'}`);
    }
  };

  const openPreview = () => {
    if (validateForm()) {
      setIsPreviewOpen(true);
    } else {
      alert('Please fix the errors in the form before previewing');
    }
  };
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const closePreview = () => setIsPreviewOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
        <header className="text-center mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-indigo-800">APPLICATION FORM FOR ADMISSION TO CATEGORY 'B' SEATS OF THE 4 YEAR B.TECH PROGRAMME FOR THE ACADEMIC YEAR 2025-26</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">CMR College of Engineering & Technology</p>
          <p className="text-gray-500 text-xs sm:text-sm">Kandlakoya(V), Medchal Road, Hyderabad, Telangana</p>
          <p className="text-gray-500 text-xs sm:text-sm">UGC Autonomous | NAAC A+ Accredited | AICTE Approved | JNTUH Affiliated</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Tele: 9248727210 |{' '}
            <a href="http://www.cmrcet.ac.in" className="text-indigo-600 hover:underline">
              www.cmrcet.ac.in
            </a>
          </p>
          <div className="mt-4">
            <img
              src="/cmrcet logo.jpg"
              alt="CMRCET Logo"
              className="mx-auto object-cover border-2 border-indigo-200 max-w-[150px] sm:max-w-[200px]"
            />
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <details className="bg-gray-50 p-4 rounded-lg" open>
            <summary className="text-lg font-semibold text-indigo-800 cursor-pointer">Personal Information</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  placeholder="Enter your full name"
                  className={`mt-1 block w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange(e, 'photo')}
                  className={`mt-1 block w-full border ${errors.photo ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                  required
                />
                {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Father's Name *</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange(e, 'fatherName')}
                  placeholder="Enter father's name"
                  className={`mt-1 block w-full border ${errors.fatherName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange(e, 'address')}
                  placeholder="Enter your full address"
                  className={`mt-1 block w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  rows="3"
                  required
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange(e, 'mobile')}
                  placeholder="Enter mobile number"
                  className={`mt-1 block w-full border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Resident Status *</label>
                <div className="mt-2 flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="resident"
                      value="Telangana"
                      onChange={(e) => handleInputChange(e, 'resident')}
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                      required
                    />
                    Telangana
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="resident"
                      value="Other"
                      onChange={(e) => handleInputChange(e, 'resident')}
                      className="mr-2 text-indigo-600 focus:ring-indigo-500"
                    />
                    Other State
                  </label>
                </div>
                {errors.resident && <p className="text-red-500 text-xs mt-1">{errors.resident}</p>}
              </div>
            </div>
          </details>

          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="text-lg font-semibold text-indigo-800 cursor-pointer">Entrance Exam Details</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">IIT JEE Main 2024 Rank</label>
                <input
                  type="number"
                  value={formData.jeeRank}
                  onChange={(e) => handleInputChange(e, 'jeeRank')}
                  placeholder="Enter JEE rank"
                  className={`mt-1 block w-full border ${errors.jeeRank ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.jeeRank && <p className="text-red-500 text-xs mt-1">{errors.jeeRank}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">TG EAPCET-2024 Rank</label>
                <input
                  type="number"
                  value={formData.eapcetRank}
                  onChange={(e) => handleInputChange(e, 'eapcetRank')}
                  placeholder="Enter EAPCET rank"
                  className={`mt-1 block w-full border ${errors.eapcetRank ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.eapcetRank && <p className="text-red-500 text-xs mt-1">{errors.eapcetRank}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">EAPCET-2024 Hall Ticket</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'eapcetHallTicket')}
                  className={`mt-1 block w-full border ${errors.eapcetHallTicket ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                {errors.eapcetHallTicket && <p className="text-red-500 text-xs mt-1">{errors.eapcetHallTicket}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">EAPCET-2024 Rank Card</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'eapcetRankCard')}
                  className={`mt-1 block w-full border ${errors.eapcetRankCard ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                {errors.eapcetRankCard && <p className="text-red-500 text-xs mt-1">{errors.eapcetRankCard}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">JEE-2024 Hall Ticket</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'jeeHallTicket')}
                  className={`mt-1 block w-full border ${errors.jeeHallTicket ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                {errors.jeeHallTicket && <p className="text-red-500 text-xs mt-1">{errors.jeeHallTicket}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">JEE-2024 Rank Card</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'jeeRankCard')}
                  className={`mt-1 block w-full border ${errors.jeeRankCard ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                {errors.jeeRankCard && <p className="text-red-500 text-xs mt-1">{errors.jeeRankCard}</p>}
              </div>
            </div>
          </details>

          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="text-lg font-semibold text-indigo-800 cursor-pointer">10th Class Details</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Board and State</label>
                <input
                  type="text"
                  value={formData.board10th}
                  onChange={(e) => handleInputChange(e, 'board10th')}
                  placeholder="e.g., CBSE, Telangana"
                  className={`mt-1 block w-full border ${errors.board10th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.board10th && <p className="text-red-500 text-xs mt-1">{errors.board10th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Maximum Marks</label>
                <input
                  type="number"
                  value={formData.maxMarks10th}
                  onChange={(e) => handleInputChange(e, 'maxMarks10th')}
                  placeholder="e.g., 500"
                  className={`mt-1 block w-full border ${errors.maxMarks10th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.maxMarks10th && <p className="text-red-500 text-xs mt-1">{errors.maxMarks10th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marks Obtained</label>
                <input
                  type="number"
                  value={formData.marksObtained10th}
                  onChange={(e) => handleInputChange(e, 'marksObtained10th')}
                  placeholder="e.g., 450"
                  className={`mt-1 block w-full border ${errors.marksObtained10th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.marksObtained10th && <p className="text-red-500 text-xs mt-1">{errors.marksObtained10th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.gpa10th}
                  onChange={(e) => handleInputChange(e, 'gpa10th')}
                  placeholder="e.g., 9.5"
                  className={`mt-1 block w-full border ${errors.gpa10th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.gpa10th && <p className="text-red-500 text-xs mt-1">{errors.gpa10th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">10th Memo</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'memo10th')}
                  className={`mt-1 block w-full border ${errors.memo10th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                />
                {errors.memo10th && <p className="text-red-500 text-xs mt-1">{errors.memo10th}</p>}
              </div>
            </div>
          </details>

          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="text-lg font-semibold text-indigo-800 cursor-pointer">12th Class Details</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Board and State *</label>
                <input
                  type="text"
                  value={formData.board12th}
                  onChange={(e) => handleInputChange(e, 'board12th')}
                  placeholder="e.g., CBSE, Telangana"
                  className={`mt-1 block w-full border ${errors.board12th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.board12th && <p className="text-red-500 text-xs mt-1">{errors.board12th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Maximum Marks *</label>
                <input
                  type="number"
                  value={formData.maxMarks12th}
                  onChange={(e) => handleInputChange(e, 'maxMarks12th')}
                  placeholder="e.g., 600"
                  className={`mt-1 block w-full border ${errors.maxMarks12th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.maxMarks12th && <p className="text-red-500 text-xs mt-1">{errors.maxMarks12th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marks Obtained *</label>
                <input
                  type="number"
                  value={formData.marksObtained12th}
                  onChange={(e) => handleInputChange(e, 'marksObtained12th')}
                  placeholder="e.g., 540"
                  className={`mt-1 block w-full border ${errors.marksObtained12th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.marksObtained12th && <p className="text-red-500 text-xs mt-1">{errors.marksObtained12th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Percentage *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.percentage12th}
                  onChange={(e) => handleInputChange(e, 'percentage12th')}
                  placeholder="e.g., 90.00"
                  className={`mt-1 block w-full border ${errors.percentage12th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  required
                />
                {errors.percentage12th && <p className="text-red-500 text-xs mt-1">{errors.percentage12th}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">12th Memo *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleInputChange(e, 'memo12th')}
                  className={`mt-1 block w-full border ${errors.memo12th ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100`}
                  required
                />
                {errors.memo12th && <p className="text-red-500 text-xs mt-1">{errors.memo12th}</p>}
              </div>
            </div>
          </details>

          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="text-lg font-semibold text-indigo-800 cursor-pointer">Branch Preferences</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {Array.from({ length: 7 }, (_, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700">Priority {index + 1}</label>
                  <select
                    value={formData.priorities[index]}
                    onChange={(e) => handleInputChange(e, 'priorities', index)}
                    className={`mt-1 block w-full border ${errors.priorities ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                  {errors.priorities && index === 0 && <p className="text-red-500 text-xs mt-1">{errors.priorities}</p>}
                </div>
              ))}
            </div>
          </details>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={openPreview}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Preview
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit
            </button>
          </div>
        </form>

        <Dialog open={isPreviewOpen} onClose={closePreview} className="relative z-50">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-[90vw] sm:max-w-4xl bg-white rounded-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <Dialog.Title className="text-xl sm:text-2xl font-bold text-indigo-800 mb-4">Form Preview</Dialog.Title>
              <Tab.Group>
                <Tab.List className="flex flex-wrap gap-2 rounded-xl bg-indigo-100 p-2 mb-4">
                  {['Personal Info', 'Entrance Exams', '10th Class', '12th Class', 'Preferences', 'Files'].map((tab) => (
                    <Tab
                      key={tab}
                      className={({ selected }) =>
                        `flex-1 sm:flex-none rounded-lg py-2 px-3 text-sm font-medium text-indigo-800 ${selected ? 'bg-white shadow' : 'hover:bg-indigo-200'}`
                      }
                    >
                      {tab}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels>
                  <Tab.Panel className="space-y-3">
                    <p><strong>Full Name:</strong> {formData.name || 'N/A'}</p>
                    <p><strong>Father's Name:</strong> {formData.fatherName || 'N/A'}</p>
                    <p><strong>Address:</strong> {formData.address || 'N/A'}</p>
                    <p><strong>Mobile Number:</strong> {formData.mobile || 'N/A'}</p>
                    <p><strong>Resident:</strong> {formData.resident || 'N/A'}</p>
                  </Tab.Panel>
                  <Tab.Panel className="space-y-3">
                    <p><strong>JEE Rank:</strong> {formData.jeeRank || 'N/A'}</p>
                    <p><strong>EAPCET Rank:</strong> {formData.eapcetRank || 'N/A'}</p>
                  </Tab.Panel>
                  <Tab.Panel className="space-y-3">
                    <p><strong>Board:</strong> {formData.board10th || 'N/A'}</p>
                    <p><strong>Total Marks:</strong> {formData.maxMarks10th || 'N/A'}</p>
                    <p><strong>Marks Obtained:</strong> {formData.marksObtained10th || 'N/A'}</p>
                    <p><strong>GPA:</strong> {formData.gpa10th || 'N/A'}</p>
                  </Tab.Panel>
                  <Tab.Panel className="space-y-3">
                    <p><strong>Board:</strong> {formData.board12th || 'N/A'}</p>
                    <p><strong>Total Marks:</strong> {formData.maxMarks12th || 'N/A'}</p>
                    <p><strong>Marks Obtained:</strong> {formData.marksObtained12th || 'N/A'}</p>
                    <p><strong>Percentage:</strong> {formData.percentage12th || 'N/A'}</p>
                  </Tab.Panel>
                  <Tab.Panel className="space-y-3">
                    {formData.priorities.map((priority, index) => (
                      <p key={index}><strong>Priority {index + 1}:</strong> {priority || 'N/A'}</p>
                    ))}
                  </Tab.Panel>
                  <Tab.Panel className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { field: 'photo', label: 'Photo' },
                      { field: 'memo10th', label: '10th Memo' },
                      { field: 'memo12th', label: '12th Memo' },
                      { field: 'eapcetHallTicket', label: 'EAPCET Hall Ticket' },
                      { field: 'eapcetRankCard', label: 'EAPCET Rank Card' },
                      { field: 'jeeHallTicket', label: 'JEE Hall Ticket' },
                      { field: 'jeeRankCard', label: 'JEE Rank Card' },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <p><strong>{label}:</strong></p>
                        {formData[field] ? (
                          formData[field].type === 'application/pdf' ? (
                            <p className="text-indigo-600">PDF (view after submission)</p>
                          ) : (
                            <img
                              src={URL.createObjectURL(formData[field])}
                              alt={label}
                              className="mt-1 max-w-full sm:max-w-xs h-auto rounded-lg shadow-md"
                            />
                          )
                        ) : (
                          <p className="text-gray-500">Not uploaded</p>
                        )}
                      </div>
                    ))}
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closePreview}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export default App;