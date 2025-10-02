import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useUpdateEmployeeMutation } from '../services/EmployeApi';
import { setCredentials } from '../app/authSlice';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const AdminProfile = ({ user }) => {
  const dispatch = useDispatch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const token = useSelector(state => state.auth.token);

  // Initialize state directly from the user prop.
  // This runs only on the initial render of this component instance.
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    profilePicture: null,
    address: user.address || '',
    gender: user.gender || '',
    country: user.country || '',
    city: user.city || '',
    qualification: user.qualification || '',
  });

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    const profileData = new FormData();
    profileData.append('name', formData.name);
    profileData.append('email', formData.email);
    if (formData.profilePicture) {
      profileData.append('profilePicture', formData.profilePicture);
    }
    profileData.append('address', formData.address);
    profileData.append('gender', formData.gender);
    profileData.append('country', formData.country);
    profileData.append('city', formData.city);
    profileData.append('qualification', formData.qualification);

    try {
      const updatedData = await updateProfile({ id: user._id, formData: profileData }).unwrap();
      toast.success('Profile updated successfully!', { icon: <CheckCircleIcon className="h-6 w-6 text-green-500" /> });
      if (updatedData.employee) {
        dispatch(setCredentials({ user: updatedData.employee, token: token }));
      }
      setIsEditMode(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update profile.');
      console.error('Failed to update profile:', err);
    }
  };

  const InfoField = ({ label, value }) => (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-md font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
  );
  
  const EditField = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="p-8">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-xl p-8">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold text-blue-800">{user.name}</h2>
              <p className="text-gray-600">{user.role}</p>
              <p className="text-sm text-gray-500 font-mono mt-1">{user.employeeId}</p>
            </div>
          </div>
          <button onClick={() => setIsEditMode(!isEditMode)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditMode ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EditField label="Full Name" name="name" value={formData.name} onChange={handleChange} />
              <EditField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <EditField label="Address" name="address" value={formData.address} onChange={handleChange} />
              <EditField label="City" name="city" value={formData.city} onChange={handleChange} />
              <EditField label="Country" name="country" value={formData.country} onChange={handleChange} />
              <EditField label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} />
              <div>
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <input type="file" name="profilePicture" id="profilePicture" onChange={handleChange} className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={isUpdating} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <InfoField label="Email" value={user.email} />
            <InfoField label="Gender" value={user.gender} />
            <InfoField label="Address" value={user.address} />
            <InfoField label="City" value={user.city} />
            <InfoField label="Country" value={user.country} />
            <InfoField label="Qualification" value={user.qualification} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;