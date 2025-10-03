import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateAdminMutation } from '../services/EmployeApi';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, IdentificationIcon, MapPinIcon, GlobeAltIcon, AcademicCapIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarIcon, SunIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const AdminSetup = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    profilePicture: null,
    address: '',
    gender: '',
    country: '',
    city: '',
    qualification: '',
    experience: '',
    workType: 'Full-time',
    company: '', // This was already here, which is great.
    joiningDate: '',
    workLocation: '',
    shift: 'Day',
    department: '',
  });

  const [createAdmin, { isLoading }] = useCreateAdminMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all fields.');
      return;
    }

    const adminFormData = new FormData();
    adminFormData.append('name', formData.name);
    adminFormData.append('email', formData.email);
    adminFormData.append('password', formData.password);
    adminFormData.append('employeeId', formData.employeeId);
    if (formData.profilePicture) adminFormData.append('profilePicture', formData.profilePicture);
    if (formData.address) adminFormData.append('address', formData.address);
    if (formData.gender) adminFormData.append('gender', formData.gender);
    if (formData.country) adminFormData.append('country', formData.country);
    if (formData.city) adminFormData.append('city', formData.city);
    if (formData.qualification) adminFormData.append('qualification', formData.qualification);
    if (formData.experience) adminFormData.append('experience', formData.experience);
    if (formData.workType) adminFormData.append('workType', formData.workType);
    if (formData.company) adminFormData.append('company', formData.company);
    if (formData.joiningDate) adminFormData.append('joiningDate', formData.joiningDate);
    if (formData.workLocation) adminFormData.append('workLocation', formData.workLocation);
    if (formData.shift) adminFormData.append('shift', formData.shift);
    if (formData.department) adminFormData.append('department', formData.department);

    try {
      await createAdmin(adminFormData).unwrap();
      toast.success('Admin account created successfully! You can now log in.');
      onSetupComplete();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create admin account.');
      console.error('Admin setup failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 bg-white my-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center py-8 px-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-center bg-blue-100 rounded-full h-16 w-16 shadow mb-3">
            <UserIcon className="h-9 w-9 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Setup</h2>
          <p className="text-gray-500 mt-2 text-sm text-center">
            Set up your first admin account to get started.
          </p>
        </div>
        {/* Form */}
        <form className="space-y-5 px-8 py-8 max-h-[70vh] overflow-y-auto" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <UserIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                placeholder="Full Name"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <EnvelopeIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Create Password
            </label>
            <div className="relative mt-1">
              <LockClosedIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <LockClosedIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="company" className="text-sm font-semibold text-gray-700">Company Name</label>
            <div className="relative mt-1">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="company" name="company" type="text" value={formData.company} onChange={handleChange}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="Your Company Name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeId" className="text-sm font-semibold text-gray-700">Employee ID</label>
              <div className="relative mt-1">
                <IdentificationIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="employeeId" name="employeeId" type="text" required value={formData.employeeId} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="ST-001" />
              </div>
            </div>
            <div>
              <label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="mt-1 py-2 px-3 w-full border border-gray-200 rounded-lg bg-gray-50">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="address" className="text-sm font-semibold text-gray-700">Address</label>
            <div className="relative mt-1">
              <MapPinIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="123 Main St" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="text-sm font-semibold text-gray-700">City</label>
              <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} className="mt-1 py-2 px-3 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="New York" />
            </div>
            <div>
              <label htmlFor="country" className="text-sm font-semibold text-gray-700">Country</label>
              <div className="relative mt-1">
                <GlobeAltIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="USA" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="qualification" className="text-sm font-semibold text-gray-700">Qualification</label>
              <div className="relative mt-1">
                <AcademicCapIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="qualification" name="qualification" type="text" value={formData.qualification} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="B.Sc. in Computer Science" />
              </div>
            </div>
            <div>
              <label htmlFor="experience" className="text-sm font-semibold text-gray-700">Experience</label>
              <input id="experience" name="experience" type="text" value={formData.experience} onChange={handleChange} className="mt-1 py-2 px-3 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="5+ years" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="text-sm font-semibold text-gray-700">Company Name</label>
              <div className="relative mt-1">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="StarTrack Inc." />
              </div>
            </div>
            <div>
              <label htmlFor="joiningDate" className="text-sm font-semibold text-gray-700">Joining Date</label>
              <div className="relative mt-1">
                <CalendarIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="workLocation" className="text-sm font-semibold text-gray-700">Work Location</label>
              <input id="workLocation" name="workLocation" type="text" value={formData.workLocation} onChange={handleChange} className="mt-1 py-2 px-3 w-full border border-gray-200 rounded-lg bg-gray-50" placeholder="Remote / Office" />
            </div>
            <div>
              <label htmlFor="shift" className="text-sm font-semibold text-gray-700">Shift</label>
              <div className="relative mt-1">
                <SunIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select id="shift" name="shift" value={formData.shift} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50">
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="department" className="text-sm font-semibold text-gray-700">Department</label>
              <div className="relative mt-1">
                <BuildingLibraryIcon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select id="department" name="department" value={formData.department} onChange={handleChange} className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-gray-50">
                  <option value="">Select Department</option>
                  <option value="Corporate management">Corporate management</option>
                  <option value="Human Resource">Human Resource</option>
                  <option value="Creative Designing">Creative Designing</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Marketing Operations">Marketing Operations</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Tech & Development">Tech & Development</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="profilePicture" className="text-sm font-semibold text-gray-700">Profile Picture</label>
              <input id="profilePicture" name="profilePicture" type="file" onChange={handleChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg shadow font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition"
            >
              {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
              {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSetup;