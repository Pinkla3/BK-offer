import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TabFeedbackList from './TabFeedbackList';
import TabFeedbackDetails from './TabFeedbackDetails';


const TabFeedbackView = ({ resetSelected }) => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tabResponses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResponses(res.data);
      } catch (err) {
        setError('Błąd pobierania danych');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleFeedbackBack = () => {
      setStep(1);
      setSelected(null);
      if (resetSelected) resetSelected(); // wyczyść stan w Dashboardzie
    };

    window.addEventListener('feedbackBack', handleFeedbackBack);
    return () => window.removeEventListener('feedbackBack', handleFeedbackBack);
  }, [resetSelected]);

  useEffect(() => {
    const refreshList = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tabResponses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResponses(res.data);
        console.log('✅ Feedback list refreshed');
      } catch (err) {
        console.error('❌ Błąd przy odświeżaniu feedbacków:', err);
      }
    };
  
    const handleUpdate = () => {
      refreshList();
    };
  
    window.addEventListener('feedbackUpdated', handleUpdate);
    return () => window.removeEventListener('feedbackUpdated', handleUpdate);
  }, []);

  const handleNext = (item) => {
    setSelected(item);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelected(null);
    if (resetSelected) resetSelected(); // wyczyść stan w rodzicu
  };
  

  if (loading) return <p style={{ padding: '40px' }}>Ładowanie...</p>;
  if (error) return <p style={{ padding: '40px', color: 'red' }}>{error}</p>;

  const handleAddResponse = (newEntry) => {
    setResponses(prev => [newEntry, ...prev]);
  };
  
  if (step === 1) {
    return (
      <TabFeedbackList
        key={responses.length} // 🔁 wymuszenie rerenderowania po zmianie długości listy
        responses={responses}
        onSelect={handleNext}
        onAdd={handleAddResponse}
      />
    );
  }

  return (
    <TabFeedbackDetails selected={selected} onBack={handleBack} setSelected={setSelected} />
  );
};

export default TabFeedbackView;
