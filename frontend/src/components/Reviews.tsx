import React, { useEffect, useRef, useState } from 'react';
import { reviewAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { staggerFadeIn, bounceInColorful } from '../animations/gsapAnimations';
import './Reviews.css';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsProps {
  eventId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ eventId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    sentiment: string;
    positivePoints: string[];
    negativePoints: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReviews();
    setAiSummary(null);
  }, [eventId]);

  useEffect(() => {
    if (!loading && reviewsRef.current) {
      const reviewCards = reviewsRef.current.querySelectorAll('.review-card');
      if (reviewCards.length > 0) {
        staggerFadeIn(reviewCards, 0.1);
      }
    }
  }, [loading, reviews]);

  useEffect(() => {
    if (starsRef.current) {
      const stars = starsRef.current.querySelectorAll('.star');
      stars.forEach((star, index) => {
        bounceInColorful(star as HTMLElement, index * 0.1);
      });
    }
  }, [averageRating]);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getEventReviews(eventId);
      setReviews(response.data.reviews);
      setAverageRating(parseFloat(response.data.averageRating));
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setSubmitting(true);
    try {
      await reviewAPI.create({ eventId, rating, comment });
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
      setAiSummary(null);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiSummarize = async () => {
    if (aiLoading || totalReviews === 0) return;

    setAiLoading(true);
    setAiSummary(null);
    try {
      const response = await aiAPI.summarizeReviews(eventId);
      setAiSummary(response.data);
    } catch (error) {
      console.error('AI review summarizer error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={`star ${i < count ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  const sentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😄 Positive';
      case 'negative': return '😞 Negative';
      case 'mixed': return '😐 Mixed';
      default: return '😶 Neutral';
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>⭐ Reviews & Ratings</h3>
        <div className="rating-summary" ref={starsRef}>
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">{renderStars(Math.round(averageRating))}</div>
            <span className="total-reviews">({totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="ai-summarize-row">
        <button
          className="btn-ai-summarize"
          onClick={handleAiSummarize}
          disabled={aiLoading || totalReviews === 0}
        >
          {aiLoading ? '⏳ Gemini is summarizing...' : '✨ Summarize Reviews with AI'}
        </button>
        {totalReviews === 0 && (
          <span className="ai-summarize-hint">Add reviews first to generate an AI summary.</span>
        )}
      </div>

      {aiSummary && (
        <div className="ai-review-summary">
          <div className="ai-summary-header">
            <span className="ai-summary-badge">🤖 Gemini Review Summary</span>
            <span className={`ai-summary-sentiment sentiment-${aiSummary.sentiment}`}>
              {sentimentLabel(aiSummary.sentiment)}
            </span>
          </div>
          <p className="ai-summary-text">{aiSummary.summary}</p>

          {(aiSummary.positivePoints.length > 0 || aiSummary.negativePoints.length > 0) && (
            <div className="ai-summary-points">
              {aiSummary.positivePoints.length > 0 && (
                <div className="ai-summary-positive">
                  <strong>👍 What people loved</strong>
                  <ul>
                    {aiSummary.positivePoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiSummary.negativePoints.length > 0 && (
                <div className="ai-summary-negative">
                  <strong>👎 What people mentioned</strong>
                  <ul>
                    {aiSummary.negativePoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isAuthenticated && !showForm && (
        <button className="btn-add-review" onClick={() => setShowForm(true)}>
          ✍️ Write a Review
        </button>
      )}

      {showForm && isAuthenticated && (
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              required
              maxLength={500}
            />
            <span className="char-count">{comment.length}/500</span>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      <div ref={reviewsRef} className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{review.user.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <h4>{review.user.name}</h4>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;

