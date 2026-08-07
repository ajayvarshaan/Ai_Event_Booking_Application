import { Router } from 'express';
import {
  chat,
  recommend,
  personalized,
  search,
  itinerary,
  generateDescription,
  summarizeReviews,
  pricingAdvice,
  bookingAssistant,
  demandForecast
} from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/chat', protect, chat);
router.post('/recommend', protect, recommend);
router.post('/personalized', protect, personalized);
router.post('/search', protect, search);
router.post('/itinerary', protect, itinerary);
router.post('/generate-description', protect, generateDescription);
router.post('/summarize-reviews', protect, summarizeReviews);
router.post('/pricing-advice', protect, pricingAdvice);
router.post('/booking-assistant', protect, bookingAssistant);
router.post('/demand-forecast', protect, demandForecast);

export default router;
