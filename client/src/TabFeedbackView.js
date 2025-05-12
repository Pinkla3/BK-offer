import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TabFeedbackList from './TabFeedbackList';
import TabFeedbackDetails from './TabFeedbackDetails';
import { toast } from 'react-toastify';

const API_BASE_URL = 'https://desk.berlin-opiekunki.pl';

const TabFeedbackView = ({ resetSelected }) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/tabResponses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResponses(res.data);
    } catch (err) {
      console.error('Błąd podczas pobierania danych:', err);
      setError('Nie udało się załadować danych');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNext = (entry) => {
    setSelected(entry);
    setStep(2);
  };

  const handleAddResponse = (entry) => {
    setSelected(entry);
    setStep(2);
  };

  const handleFeedbackBack = async () => {
    setSelected(null);
    setStep(1);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/tabResponses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setResponses(res.data);
      console.log('📥 Lista odświeżona po powrocie z widoku szczegółowego');
    } catch (err) {
      console.error('Błąd odświeżania po powrocie:', err);
    }

    if (resetSelected) resetSelected();
  };

  useEffect(() => {
    const refreshList = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_BASE_URL}/api/tabResponses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setResponses(res.data);
        console.log('✅ Feedback list refreshed');
      } catch (err) {
        console.error('❌ Błąd przy odświeżaniu feedbacków:', err);
        setError('Błąd podczas odświeżania danych');
      } finally {
        setLoading(false);
      }
    };

    const handleUpdate = () => {
      refreshList();
    };

    window.addEventListener('feedbackUpdated', handleUpdate);
    return () => window.removeEventListener('feedbackUpdated', handleUpdate);
  }, []);

  return (
    <div>
      {step === 1 ? (
        <TabFeedbackList
          key={JSON.stringify(responses.map((r) => r.edit_history))}
          responses={responses}
          onSelect={handleNext}
          onAdd={handleAddResponse}
        />
      ) : (
        <TabFeedbackDetails
  selected={selected}
  setSelected={setSelected}
  onBack={handleFeedbackBack}
/>
      )}
    </div>
  );
};

export default TabFeedbackView;
