import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, aiAPI } from '../services/api';
import { fadeInUp, scaleIn } from '../animations/gsapAnimations';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import './CreateEvent.css';

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: 0,
    capacity: 0,
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('https://via.placeholder.com/400x300?text=Event+Image');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/home');
    }
    fadeInUp(titleRef.current);
    scaleIn(formRef.current);
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'capacity' ? parseFloat(value) : value
    }));
    
    if (name === 'image' && value) {
      setImagePreview(value);
    }
  };

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      setToast({ message: 'Enter a title first so AI can generate a description!', type: 'info' });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await aiAPI.generateDescription({
        title: formData.title,
        category: formData.category || undefined,
        location: formData.location || undefined,
        price: formData.price || undefined,
        date: formData.date || undefined
      });

      const { description, suggestedCategory, suggestedPrice, suggestedCapacity } = response.data;

      setFormData((prev) => ({
        ...prev,
        description: description || prev.description,
        category: suggestedCategory || prev.category,
        price: suggestedPrice || prev.price,
        capacity: suggestedCapacity || prev.capacity
      }));

      setToast({ message: '✨ AI generated event details! Review and adjust as needed.', type: 'success' });
    } catch (error) {
      console.error('AI generation error:', error);
      setToast({ message: 'AI generation failed. Please try again.', type: 'error' });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop'
      };
      await eventAPI.create(eventData);
      setToast({ message: 'Event created successfully! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/home'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
      setToast({ message: 'Failed to create event', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="create-event">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="container">
        <h1 ref={titleRef}>Create New Event</h1>
        <div ref={formRef} className="event-form card">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="image-preview-section">
              <label>Event Image Preview</label>
              <div className="image-preview">
                <img src={imagePreview} alt="Event preview" onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                }} />
              </div>
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg (or use Unsplash URLs)"
              />
              <small className="form-hint">Tip: Use Unsplash for free images - https://unsplash.com/</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option value="music">Music</option>
                  <option value="sports">Sports</option>
                  <option value="tech">Technology</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <div className="ai-generate-row">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
                <button
                  type="button"
                  className="ai-generate-btn"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? '⏳ Generating...' : '✨ Generate with AI'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price per Seat ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
