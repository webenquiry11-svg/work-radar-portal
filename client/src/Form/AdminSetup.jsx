import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateAdminMutation } from '../services/EmployeApi';
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, IdentificationIcon, MapPinIcon, GlobeAltIcon, AcademicCapIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarIcon, SunIcon, BuildingLibraryIcon, SparklesIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const InputField = ({ id, name, label, type = 'text', value, onChange, placeholder, icon: Icon, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium transition"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const SelectField = ({ id, name, label, value, onChange, children, icon: Icon }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-1">
      {label}
    </label>
    <div className="relative">
      {Icon && <Icon className="h-5 w-5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 font-medium appearance-none transition"
      >
        {children}
      </select>
    </div>
  </div>
);

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
    workLocation: '',
    shift: 'Day',
    department: '',
  });
  const [step, setStep] = useState(1);

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

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error("Please fill all account fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.company || !formData.employeeId || !formData.department) {
        toast.error("Please fill all company and role fields.");
        return;
      }
    }
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { number: 1, title: 'Admin Account', icon: UserIcon },
    { number: 2, title: 'Company & Role', icon: BuildingOfficeIcon },
    { number: 3, title: 'Personal Details', icon: IdentificationIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-8 flex items-center justify-center font-manrope">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden grid md:grid-cols-3">
        {/* Sidebar */}
        <div className="md:col-span-1 bg-gradient-to-b from-blue-50 to-indigo-100 p-8 border-r border-slate-200/80">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-blue-800 tracking-tight">Portal Setup</h2>
          </div>
          <nav>
            <ul className="space-y-4">
              {steps.map((s) => (
                <li key={s.number} className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${step >= s.number ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                    {step > s.number ? <CheckIcon className="h-6 w-6" /> : <s.icon className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors ${step >= s.number ? 'text-blue-800' : 'text-slate-500'}`}>Step {s.number}</p>
                    <p className={`text-lg font-semibold transition-colors ${step >= s.number ? 'text-slate-800' : 'text-slate-400'}`}>{s.title}</p>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Form Content */}
        <div className="md:col-span-2 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
              {step === 1 && (
                <fieldset className="space-y-8 animate-fade-in">
                  <div className="relative">
                    <div className="absolute -left-4 -top-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                      <UserIcon className="h-8 w-8" />
                    </div>
                    <div className="pl-16 pt-2">
                      <h3 className="text-2xl font-bold text-slate-800">Create Your Admin Account</h3>
                      <p className="text-sm text-slate-500">This will be the primary account for managing the portal.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="name" name="name" label="Full Name" value={formData.name} onChange={handleChange} placeholder="Admin Name" icon={UserIcon} required />
                    <InputField id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="admin@example.com" icon={EnvelopeIcon} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="password" name="password" label="Create Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" icon={LockClosedIcon} required />
                    <InputField id="confirmPassword" name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" icon={LockClosedIcon} required />
                  </div>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="space-y-8 animate-fade-in">
                  <div className="relative">
                    <div className="absolute -left-4 -top-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                      <BuildingOfficeIcon className="h-8 w-8" />
                    </div>
                    <div className="pl-16 pt-2">
                      <h3 className="text-2xl font-bold text-slate-800">Define Company & Role</h3>
                      <p className="text-sm text-slate-500">Set up the company details and admin's role.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="company" name="company" label="Company Name" value={formData.company} onChange={handleChange} placeholder="Your Company Inc." icon={BuildingOfficeIcon} required />
                    <InputField id="employeeId" name="employeeId" label="Employee ID" value={formData.employeeId} onChange={handleChange} placeholder="ADMIN-001" icon={IdentificationIcon} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField id="department" name="department" label="Department" value={formData.department} onChange={handleChange} icon={BuildingLibraryIcon}>
                      <option value="">Select Department</option>
                      <option>Corporate management</option>
                      <option>Human Resource</option>
                      <option>Creative Designing</option>
                      <option>Finance & Accounts</option>
                      <option>Marketing Operations</option>
                      <option>Sales & Marketing</option>
                      <option>Tech & Development</option>
                    </SelectField>
                  </div>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="space-y-8 animate-fade-in">
                  <div className="relative">
                    <div className="absolute -left-4 -top-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                      <IdentificationIcon className="h-8 w-8" />
                    </div>
                    <div className="pl-16 pt-2">
                      <h3 className="text-2xl font-bold text-slate-800">Add Personal Details (Optional)</h3>
                      <p className="text-sm text-slate-500">These details can be filled out later if needed.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="address" name="address" label="Address" value={formData.address} onChange={handleChange} placeholder="123 Main St" icon={MapPinIcon} />
                    <SelectField id="gender" name="gender" label="Gender" value={formData.gender} onChange={handleChange} icon={UserIcon}>
                      <option value="">Select...</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </SelectField>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="city" name="city" label="City" value={formData.city} onChange={handleChange} placeholder="New York" icon={MapPinIcon} />
                    <InputField id="country" name="country" label="Country" value={formData.country} onChange={handleChange} placeholder="USA" icon={GlobeAltIcon} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField id="qualification" name="qualification" label="Qualification" value={formData.qualification} onChange={handleChange} placeholder="B.Sc. in Computer Science" icon={AcademicCapIcon} />
                    <InputField id="experience" name="experience" label="Experience" value={formData.experience} onChange={handleChange} placeholder="5+ years" icon={BriefcaseIcon} />
                  </div>
                </fieldset>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Back
                </button>
              )}
              <div className="flex-grow"></div> {/* Spacer */}
              {step < 3 && (
                <button type="button" onClick={nextStep} className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 rounded-xl shadow-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105">
                  Next
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
              {step === 3 && (
                <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center py-3 px-8 rounded-xl shadow-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:from-slate-400 disabled:to-slate-400 transition-all duration-300 transform hover:scale-105">
                  {isLoading ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" /> : <SparklesIcon className="h-5 w-5 mr-3" />}
                  {isLoading ? 'Setting Up...' : 'Create Admin & Launch'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;