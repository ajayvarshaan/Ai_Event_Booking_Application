import { Request, Response } from 'express';
import {
  chatWithGemini,
  getAIEventRecommendations,
  getPersonalizedRecommendations,
  aiNaturalLanguageSearch,
  getSmartItinerary,
  generateEventDescription,
  summarizeEventReviews,
  getPricingAdvice,
  getBookingAssistant,
  getDemandForecast
} from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const cleanHistory = Array.isArray(history) ? history : [];
    const reply = await chatWithGemini(cleanHistory, message.trim());
    res.json({ reply });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({ message: error.message || 'AI chat failed' });
  }
};

export const recommend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vibe, maxBudget, startAfter, category, query } = req.body as {
      vibe?: string;
      maxBudget?: number;
      startAfter?: string;
      category?: string;
      query?: string;
    };

    const recommendations = await getAIEventRecommendations({
      vibe,
      maxBudget,
      startAfter,
      category,
      query
    });

    res.json({ recommendations });
  } catch (error: any) {
    console.error('AI Recommendation error:', error);
    res.status(500).json({ message: error.message || 'AI recommendation failed' });
  }
};

export const personalized = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { limit } = req.body as { limit?: number };
    const result = await getPersonalizedRecommendations(req.user._id.toString(), limit || 3);
    res.json(result);
  } catch (error: any) {
    console.error('Personalized recommendation error:', error);
    res.status(500).json({ message: error.message || 'Personalized recommendations failed' });
  }
};

export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.body as { query?: string };

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const result = await aiNaturalLanguageSearch(query.trim());
    res.json(result);
  } catch (error: any) {
    console.error('AI Search error:', error);
    res.status(500).json({ message: error.message || 'AI search failed' });
  }
};

export const itinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { vibe, maxBudget, startHour, mode } = req.body as {
      vibe?: string;
      maxBudget?: number;
      startHour?: number;
      mode?: string;
    };

    const result = await getSmartItinerary({
      vibe,
      maxBudget,
      startHour,
      mode,
      userId: req.user._id.toString()
    });

    res.json(result);
  } catch (error: any) {
    console.error('Smart itinerary error:', error);
    res.status(500).json({ message: error.message || 'Smart itinerary failed' });
  }
};

export const generateDescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, location, price, date } = req.body as {
      title?: string;
      category?: string;
      location?: string;
      price?: number;
      date?: string;
    };

    const result = await generateEventDescription({ title, category, location, price, date });
    res.json(result);
  } catch (error: any) {
    console.error('Description generator error:', error);
    res.status(500).json({ message: error.message || 'Description generation failed' });
  }
};

export const summarizeReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.body as { eventId?: string };

    if (!eventId) {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }

    const result = await summarizeEventReviews(eventId);
    res.json(result);
  } catch (error: any) {
    console.error('Review summarizer error:', error);
    res.status(500).json({ message: error.message || 'Review summarization failed' });
  }
};

export const pricingAdvice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.body as { eventId?: string };

    if (!eventId) {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }

    const result = await getPricingAdvice(eventId);
    res.json(result);
  } catch (error: any) {
    console.error('Pricing advisor error:', error);
    res.status(500).json({ message: error.message || 'Pricing advice failed' });
  }
};

export const bookingAssistant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, seats } = req.body as { eventId?: string; seats?: number };

    if (!eventId) {
      res.status(400).json({ message: 'Event ID is required' });
      return;
    }

    const result = await getBookingAssistant(eventId, seats || 1);
    res.json(result);
  } catch (error: any) {
    console.error('Booking assistant error:', error);
    res.status(500).json({ message: error.message || 'Booking assistant failed' });
  }
};

export const demandForecast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getDemandForecast();
    res.json(result);
  } catch (error: any) {
    console.error('Demand forecast error:', error);
    res.status(500).json({ message: error.message || 'Demand forecast failed' });
  }
};
