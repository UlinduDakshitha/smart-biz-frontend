import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { businessProfileAPI } from '../../services/api';

export default function BusinessProfile() {

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: '',
    registrationNumber: '',
    website: '',
    logoUrl: '',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {

    try {

      const response =
        await businessProfileAPI.get();

      const business = response.data.data;

      setForm({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        address: business.address || '',
        businessType: business.businessType || '',
        registrationNumber:
          business.registrationNumber || '',
        website: business.website || '',
        logoUrl: business.logoUrl || '',
        description: business.description || '',
      });

    } catch (error) {

      console.error(error);

      toast.error(
        'Failed to load business profile'
      );

    } finally {

      setLoading(false);

    }
  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      await businessProfileAPI.update({
        name: form.name,
        phone: form.phone,
        address: form.address,
        businessType: form.businessType,
        registrationNumber:
          form.registrationNumber,
        website: form.website,
        logoUrl: form.logoUrl,
        description: form.description,
      });

      toast.success(
        'Business profile updated successfully'
      );

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        'Failed to update profile'
      );

    } finally {

      setSaving(false);

    }
  };

  if (loading) {
    return (
      <div className="p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-2">
        Business Profile
      </h1>

      <p className="text-gray-500 mb-8">
        Manage your business information
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-8 space-y-6"
      >

        {/* Business Name */}

        <div>
          <label className="block mb-2 font-medium">
            Business Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Email */}

        <div>
          <label className="block mb-2 font-medium">
            Email
          </label>

          <input
            type="email"
            value={form.email}
            disabled
            className="
              w-full
              border
              rounded-lg
              px-4
              py-3
              bg-gray-100
            "
          />
        </div>

        {/* Phone */}

        <div>
          <label className="block mb-2 font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Business Type */}

        <div>
          <label className="block mb-2 font-medium">
            Business Type
          </label>

          <input
            type="text"
            name="businessType"
            value={form.businessType}
            onChange={handleChange}
            placeholder="Retail, Restaurant, Clothing..."
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Registration Number */}

        <div>
          <label className="block mb-2 font-medium">
            Registration Number
          </label>

          <input
            type="text"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Address */}

        <div>
          <label className="block mb-2 font-medium">
            Address
          </label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows="3"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Website */}

        <div>
          <label className="block mb-2 font-medium">
            Website
          </label>

          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Logo URL */}

        <div>
          <label className="block mb-2 font-medium">
            Logo URL
          </label>

          <input
            type="url"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Description */}

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="5"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Save */}

        <div className="flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              px-6
              py-3
              rounded-lg
              font-medium
              disabled:opacity-50
            "
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>

        </div>

      </form>

    </div>
  );
}