import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AcademyContext = createContext();

export const AcademyProvider = ({ children }) => {
  const [academy, setAcademy] = useState({
    academy_name: 'Apex Horizon Academy',
    tagline: 'Inspiring Minds, Building Leaders & Shaping Futures',
    logo_url: '',
    address: 'Sector 11-A, University Road, Karachi',
    phone: '+92 300 9876543',
    email: 'info@apexhorizon.edu.pk',
    whatsapp_number: '923009876543',
    currency_symbol: 'Rs.',
    academic_year: '2025-2026',
    theme_color: '#4f46e5'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.success && res.data?.settings) {
        setAcademy(res.data.settings);
      }
    } catch (err) {
      console.warn('Could not fetch settings from server, using defaults.', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateAcademy = async (newData) => {
    const res = await api.put('/settings', newData);
    if (res.data?.success && res.data?.settings) {
      setAcademy(res.data.settings);
    }
    return res.data;
  };

  return (
    <AcademyContext.Provider value={{ academy, loading, updateAcademy, refreshSettings: fetchSettings }}>
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => useContext(AcademyContext);
