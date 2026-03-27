import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export default function WorkerProfileComplete({ profile, onComplete }) {
  const [formData, setFormData] = useState({
    first_name: profile?.user?.first_name || '',
    last_name: profile?.user?.last_name || '',
    contact_number: profile?.user?.phone_number || '',
    location: profile?.location || '',
    skills: profile?.skills || '',
    experience_years: profile?.experience_years || 0,
    expected_wage: profile?.expected_wage || '',
  });

  const [files, setFiles] = useState({
    id_proof: null,
    certificates: null,
    work_photos: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    // Append standard fields
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    // Append file fields if they exist
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      
      // Update User part (first_name, last_name, phone_number)
      await axios.patch(`${API_URL}/api/auth/me/`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.contact_number,
      }, {
         headers: { 'Authorization': `Token ${token}` }
      });

      // Update WorkerProfile part
      const res = await axios.patch(`${API_URL}/api/workers/${profile.id}/`, submitData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if(onComplete) onComplete(res.data);
      
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Complete Your Profile</h2>
      <p className="text-gray-600 mb-8">Please provide your details below to start getting job requests.</p>

      {error && <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleInputChange}
              required
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
             <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g. Mumbai, Maharashtra" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Comma separated)</label>
             <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} required placeholder="e.g. Carpentry, Plumbing, Electrician" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
             <input type="number" min="0" name="experience_years" value={formData.experience_years} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Expected Wage (per day)</label>
             <input type="number" min="0" step="0.01" name="expected_wage" value={formData.expected_wage} onChange={handleInputChange} required placeholder="e.g. 500" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Document Uploads</h3>
            
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">ID Proof (Aadhar, PAN, etc.) *</label>
                 <input type="file" name="id_proof" onChange={handleFileChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Certificates (Optional)</label>
                 <input type="file" name="certificates" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Work Photos (Optional)</label>
                 <input type="file" name="work_photos" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
             disabled={loading}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-xl font-medium text-white ${loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
