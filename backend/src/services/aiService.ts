import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Event from '../models/Event';
import Booking from '../models/Booking';
import Wishlist from '../models/Wishlist';
import Review from '../models/Review';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use a current stable model - gemini-3.5-flash is the latest available
const MODEL_NAME = 'gemini-3.5-flash';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
  }
];

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface EventContext {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  availableSeats: number;
  image: string;
}

const buildEventContext = (events: EventContext[]): string => {
  if (!events.length) return 'There are currently no events in the database.';

  return events
    .map(
      (e) =>
        `- ${e.title} (ID: ${e._id}) | Category: ${e.category} | Date: ${new Date(e.date).toLocaleDateString()} | Time: ${e.time} | Location: ${e.location} | Price: $${e.price} | Capacity: ${e.capacity} | Available Seats: ${e.availableSeats} | Description: ${e.description}`
    )
    .join('\n');
};

const buildSystemPrompt = (events: EventContext[]): string => {
  const eventContext = buildEventContext(events);

  return `You are "EventAI", a helpful AI assistant for the EventHub event booking platform. You help users find events, answer questions about events, recommend events based on their preferences, and provide booking guidance.

CURRENT AVAILABLE EVENTS (use this data as your source of truth for events):
${eventContext}

GUIDELINES:
1. When users ask about available events, recommend from the CURRENT AVAILABLE EVENTS list above only. Do not invent events that are not in this list.
2. If asked about event details (date, time, price, location, availability), use the data above.
3. If a user asks for recommendations based on vibe/budget/date, analyze the events above and suggest the best matches with reasoning.
4. If asked about booking, explain they can book via the "Book Now" button on the event card or via the Book page. Booking requires the user to be logged in.
5. Keep responses helpful, concise, and well-formatted. Use bullet points when listing multiple events.
6. If no events match the user's request, say so politely and suggest adjusting filters (higher budget, different date, etc.).
7. Format prices with a $ sign. Format dates in a readable format (e.g., "Dec 15, 2025").
8. You may also answer general questions about the EventHub platform (features, how to create events as an admin, wishlist, compare, plan evening features, etc.).
9. Always be friendly and professional.`;
};

export const chatWithGemini = async (
  messages: ChatMessage[],
  userMessage: string
): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    // Fetch fresh events from the database
    const eventDocs = await Event.find().populate('organizer', 'name email').lean().exec();
    const events: EventContext[] = eventDocs.map((doc: any) => ({
      _id: String(doc._id),
      title: doc.title,
      description: doc.description,
      date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
      time: doc.time,
      location: doc.location,
      category: doc.category,
      price: doc.price,
      capacity: doc.capacity,
      availableSeats: doc.availableSeats,
      image: doc.image
    }));

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: buildSystemPrompt(events)
    });

    // Map chat history: filter to user/model turns, include the latest user message
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'model')
      .map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }
};

export const getAIEventRecommendations = async (
  preferences: {
    vibe?: string;
    maxBudget?: number;
    startAfter?: string;
    category?: string;
    query?: string;
  }
): Promise<string> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const eventDocs = await Event.find().lean().exec();
    const events: EventContext[] = eventDocs.map((doc: any) => ({
      _id: String(doc._id),
      title: doc.title,
      description: doc.description,
      date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
      time: doc.time,
      location: doc.location,
      category: doc.category,
      price: doc.price,
      capacity: doc.capacity,
      availableSeats: doc.availableSeats,
      image: doc.image
    }));

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", an event recommendation engine for EventHub.
CURRENT AVAILABLE EVENTS:
${buildEventContext(events)}

Based on the user's preferences, recommend the 3-5 best matching events from the list above.
Explain briefly why each recommendation matches. Format as a friendly list. Do not invent events.`
    });

    const prefText = [
      preferences.vibe ? `Vibe: ${preferences.vibe}` : '',
      preferences.maxBudget ? `Max Budget: $${preferences.maxBudget}` : '',
      preferences.startAfter ? `Start After: ${preferences.startAfter}` : '',
      preferences.category ? `Category: ${preferences.category}` : '',
      preferences.query ? `Additional request: ${preferences.query}` : ''
    ]
      .filter(Boolean)
      .join(', ');

    const prompt = `Recommend events for me. ${prefText || 'I want some event suggestions.'}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini recommendation error:', error);
    throw new Error(error.message || 'Failed to get AI recommendations');
  }
};

const fetchAllEvents = async (): Promise<EventContext[]> => {
  const eventDocs = await Event.find().lean().exec();
  return eventDocs.map((doc: any) => ({
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    date: doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
    time: doc.time,
    location: doc.location,
    category: doc.category,
    price: doc.price,
    capacity: doc.capacity,
    availableSeats: doc.availableSeats,
    image: doc.image
  }));
};

const fetchUserPreferences = async (userId: string): Promise<{
  bookedCategories: string[];
  wishlistedCategories: string[];
  maxPricePaid: number;
  favoriteLocations: string[];
  totalBookings: number;
}> => {
  const [bookings, wishlist] = await Promise.all([
    Booking.find({ user: userId, status: { $ne: 'cancelled' } })
      .populate('event', 'title category price location')
      .lean()
      .exec(),
    Wishlist.findOne({ user: userId }).populate('events', 'title category price location').lean().exec()
  ]);

  const bookedCategories = new Set<string>();
  const favoriteLocations = new Set<string>();
  let maxPricePaid = 0;

  bookings.forEach((b: any) => {
    if (b.event) {
      bookedCategories.add(b.event.category);
      favoriteLocations.add(b.event.location);
      if (b.event.price > maxPricePaid) maxPricePaid = b.event.price;
    }
  });

  const wishlistedCategories = new Set<string>();
  (wishlist?.events || []).forEach((e: any) => {
    if (e?.category) wishlistedCategories.add(e.category);
  });

  return {
    bookedCategories: Array.from(bookedCategories),
    wishlistedCategories: Array.from(wishlistedCategories),
    maxPricePaid,
    favoriteLocations: Array.from(favoriteLocations),
    totalBookings: bookings.length
  };
};

export const getPersonalizedRecommendations = async (
  userId: string,
  limit: number = 3
): Promise<{ recommendations: string; eventIds: string[] }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const [events, prefs] = await Promise.all([
      fetchAllEvents(),
      fetchUserPreferences(userId)
    ]);

    const preferencesText = [
      prefs.bookedCategories.length
        ? `Categories user has booked before: ${prefs.bookedCategories.join(', ')}`
        : '',
      prefs.wishlistedCategories.length
        ? `Categories user has wishlisted: ${prefs.wishlistedCategories.join(', ')}`
        : '',
      prefs.maxPricePaid > 0 ? `Max price user has paid: $${prefs.maxPricePaid}` : '',
      prefs.favoriteLocations.length
        ? `Favorite locations: ${prefs.favoriteLocations.join(', ')}`
        : '',
      `Total bookings: ${prefs.totalBookings}`
    ]
      .filter(Boolean)
      .join('\n');

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a personalized event recommendation engine for EventHub.
CURRENT AVAILABLE EVENTS:
${buildEventContext(events)}

USER PROFILE (derived from their booking history and wishlist):
${preferencesText}

Recommend the top ${limit} events from the list above that best match this user's preferences.
For each recommendation, include:
- Event name (exact title from the list)
- Event ID (exact _id from the list)
- A brief personalized explanation of why it matches their interests (1-2 sentences)

Format output as:
1. [Event Title] (ID: [event_id])
   Why: [personalized explanation]
2. ...

Only recommend events from the CURRENT AVAILABLE EVENTS list. Do not invent events.`
    });

    const result = await model.generateContent(
      `Recommend ${limit} personalized events for this user based on their profile and past behavior.`
    );
    const text = result.response.text();

    // Extract event IDs from the response
    const eventIds: string[] = [];
    const idRegex = /ID:\s*([a-fA-F0-9]{24})/g;
    let match;
    while ((match = idRegex.exec(text)) !== null) {
      if (!eventIds.includes(match[1])) eventIds.push(match[1]);
    }

    return { recommendations: text, eventIds };
  } catch (error: any) {
    console.error('Personalized recommendation error:', error);
    throw new Error(error.message || 'Failed to get personalized recommendations');
  }
};

export const aiNaturalLanguageSearch = async (
  query: string
): Promise<{ explanation: string; eventIds: string[] }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const events = await fetchAllEvents();

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a natural language search engine for the EventHub event booking platform.
CURRENT AVAILABLE EVENTS:
${buildEventContext(events)}

The user will type a natural language search query like "jazz concerts under $50 this weekend" or "business events in New York".
Interpret the query and return the IDs of matching events from the list above.

Rules:
1. Only return event IDs that exist in the CURRENT AVAILABLE EVENTS list.
2. Consider: category, price, date, time, location, description keywords, capacity.
3. If no events match, explain why and suggest alternatives.
4. Limit results to max 5 events.

Format response as:
MATCHED_EVENTS: [comma-separated event IDs, or NONE]
EXPLANATION: [brief explanation of what you matched and why, or why no events matched]`
    });

    const result = await model.generateContent(query);
    const text = result.response.text();

    const eventIds: string[] = [];
    const matchBlock = text.match(/MATCHED_EVENTS:\s*(.*)/i);
    if (matchBlock) {
      const idPart = matchBlock[1].trim();
      if (idPart.toUpperCase() !== 'NONE') {
        const ids = idPart.split(',').map((s) => s.trim());
        ids.forEach((id) => {
          if (/^[a-fA-F0-9]{24}$/.test(id) && !eventIds.includes(id)) {
            eventIds.push(id);
          }
        });
      }
    }

    const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : text;

    return { explanation, eventIds };
  } catch (error: any) {
    console.error('AI search error:', error);
    throw new Error(error.message || 'Failed to perform AI search');
  }
};

export const getSmartItinerary = async (
  preferences: {
    vibe?: string;
    maxBudget?: number;
    startHour?: number;
    mode?: string;
    userId: string;
  }
): Promise<{ itinerary: string; eventIds: string[] }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const [events, prefs] = await Promise.all([
      fetchAllEvents(),
      fetchUserPreferences(preferences.userId)
    ]);

    const userPrefText = prefs.bookedCategories.length
      ? `User's past preferences: ${prefs.bookedCategories.join(', ')}`
      : 'New user with no booking history yet.';

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a smart evening itinerary planner for EventHub.
CURRENT AVAILABLE EVENTS:
${buildEventContext(events)}

USER PROFILE: ${userPrefText}

Create the perfect evening plan based on the user's preferences:
- Vibe: ${preferences.vibe || 'any'}
- Max Budget: $${preferences.maxBudget || 'no limit'}
- Start After: ${preferences.startHour ? `${String(preferences.startHour).padStart(2, '0')}:00` : 'any time'}
- Mode: ${preferences.mode === 'single-night' ? 'single night (all events on the same day)' : 'flexible (one event per day)'}

Rules:
1. Recommend 2-4 events from the CURRENT AVAILABLE EVENTS list only.
2. Consider budget, category matching vibe, event time (>= start hour), and location.
3. ${preferences.mode === 'single-night' ? 'All events must be on the same date. Prioritize events on the same day and sort by time of day.' : 'Pick events on different days, sorted by how well they fit.'}
4. For each event include its exact ID, title, time, price, and a brief "why" explanation.
5. If none fit, say so politely and suggest loosening budget or vibe.

Format as:
✨ Your Perfect Evening Plan ✨

1. [Event Title] (ID: [event_id])
   📅 [date] at [time] | 📍 [location] | 💰 $[price]
   Why: [explanation]

2. ...`
    });

    const result = await model.generateContent(
      `Create my ${preferences.mode === 'single-night' ? 'single-night' : 'flexible'} evening plan with vibe ${preferences.vibe || 'any'}, max budget $${preferences.maxBudget || 'no limit'}, starting after ${preferences.startHour ? String(preferences.startHour) : 'any'} hour.`
    );
    const text = result.response.text();

    const eventIds: string[] = [];
    const idRegex = /ID:\s*([a-fA-F0-9]{24})/g;
    let match;
    while ((match = idRegex.exec(text)) !== null) {
      if (!eventIds.includes(match[1])) eventIds.push(match[1]);
    }

    return { itinerary: text, eventIds };
  } catch (error: any) {
    console.error('Smart itinerary error:', error);
    throw new Error(error.message || 'Failed to generate smart itinerary');
  }
};

// ===== Feature #4: AI Event Description Generator =====
export const generateEventDescription = async (
  eventDetails: {
    title?: string;
    category?: string;
    location?: string;
    price?: number;
    date?: string;
  }
): Promise<{ description: string; suggestedCategory: string; suggestedPrice: number; suggestedCapacity: number }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const events = await fetchAllEvents();

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", an event description generator for EventHub.
CURRENT EXISTING EVENTS (for reference):
${buildEventContext(events)}

Generate a compelling event description and smart suggestions based on the event details provided.

Rules:
1. Write a compelling 2-3 sentence description that highlights the event's appeal.
2. Suggest the best category from: music, sports, tech, business, other.
3. Suggest a competitive price based on similar events.
4. Suggest a reasonable capacity based on event type.

Format response EXACTLY as:
DESCRIPTION: [compelling description]
CATEGORY: [suggested category]
PRICE: [suggested price number only]
CAPACITY: [suggested capacity number only]`
    });

    const detailsText = [
      eventDetails.title ? `Title: ${eventDetails.title}` : '',
      eventDetails.category ? `Category: ${eventDetails.category}` : '',
      eventDetails.location ? `Location: ${eventDetails.location}` : '',
      eventDetails.price ? `Price: $${eventDetails.price}` : '',
      eventDetails.date ? `Date: ${eventDetails.date}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const result = await model.generateContent(
      `Generate an event description and suggestions for this event:\n${detailsText || 'A new event'}\n\nMake it exciting and professional.`
    );
    const text = result.response.text();

    const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*?)(?=\nCATEGORY:|\nPRICE:|\nCAPACITY:)/i);
    const catMatch = text.match(/CATEGORY:\s*(\w+)/i);
    const priceMatch = text.match(/PRICE:\s*(\d+)/i);
    const capMatch = text.match(/CAPACITY:\s*(\d+)/i);

    return {
      description: descMatch ? descMatch[1].trim() : text,
      suggestedCategory: catMatch ? catMatch[1].toLowerCase() : eventDetails.category || 'other',
      suggestedPrice: priceMatch ? Number(priceMatch[1]) : eventDetails.price || 50,
      suggestedCapacity: capMatch ? Number(capMatch[1]) : 200
    };
  } catch (error: any) {
    console.error('Event description generator error:', error);
    throw new Error(error.message || 'Failed to generate event description');
  }
};

// ===== Feature #5: AI Review Summarizer =====
export const summarizeEventReviews = async (
  eventId: string
): Promise<{ summary: string; sentiment: string; positivePoints: string[]; negativePoints: string[] }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const event = await Event.findById(eventId).lean().exec();
    if (!event) {
      throw new Error('Event not found');
    }

    const reviews = await Review.find({ event: eventId })
      .populate('user', 'name')
      .lean()
      .exec();

    if (reviews.length === 0) {
      return {
        summary: 'No reviews yet for this event.',
        sentiment: 'neutral',
        positivePoints: [],
        negativePoints: []
      };
    }

    const reviewsText = reviews
      .map((r: any) => `- Rating: ${r.rating}/5 | ${r.comment}`)
      .join('\n');

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a review summarizer for EventHub.
Event: ${event.title}
Reviews:
${reviewsText}

Summarize the reviews concisely. Identify the overall sentiment and key positive/negative points.

Format response EXACTLY as:
SUMMARY: [2-3 sentence summary of what reviewers said]
SENTIMENT: [positive | negative | mixed | neutral]
POSITIVE: [comma-separated list of positive points]
NEGATIVE: [comma-separated list of negative points]`
    });

    const result = await model.generateContent('Summarize these event reviews.');
    const text = result.response.text();

    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nSENTIMENT:|\nPOSITIVE:|\nNEGATIVE:)/i);
    const sentimentMatch = text.match(/SENTIMENT:\s*(\w+)/i);
    const positiveMatch = text.match(/POSITIVE:\s*([\s\S]*?)(?=\nNEGATIVE:)/i);
    const negativeMatch = text.match(/NEGATIVE:\s*([\s\S]*)/i);

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : text,
      sentiment: sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral',
      positivePoints: positiveMatch
        ? positiveMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      negativePoints: negativeMatch
        ? negativeMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
        : []
    };
  } catch (error: any) {
    console.error('Review summarizer error:', error);
    throw new Error(error.message || 'Failed to summarize reviews');
  }
};

// ===== Feature #6: AI Smart Pricing Advisor =====
export const getPricingAdvice = async (
  eventId: string
): Promise<{ advice: string; recommendedPrice: number; riskLevel: string }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const event = await Event.findById(eventId).lean().exec();
    if (!event) {
      throw new Error('Event not found');
    }

    const bookings = await Booking.find({ event: eventId, status: { $ne: 'cancelled' } }).lean().exec();
    const allEvents = await fetchAllEvents();

    const demandRatio = event.capacity > 0 ? (event.capacity - event.availableSeats) / event.capacity : 0;
    const similarEvents = allEvents.filter((e) => e.category === event.category && e._id !== String(event._id));
    const similarPrices = similarEvents.map((e) => e.price);
    const avgSimilarPrice = similarPrices.length > 0
      ? similarPrices.reduce((a, b) => a + b, 0) / similarPrices.length
      : event.price;

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a smart pricing advisor for EventHub.
Event: ${event.title}
Category: ${event.category}
Current Price: $${event.price}
Capacity: ${event.capacity}
Available Seats: ${event.availableSeats}
Demand Ratio: ${Math.round(demandRatio * 100)}%
Total Bookings: ${bookings.length}
Average Price of Similar Events: $${Math.round(avgSimilarPrice)}

Analyze the pricing and provide advice:
1. Is the current price optimal?
2. Should the price be raised, lowered, or kept the same?
3. What is the recommended price?
4. What is the risk level of this event selling out or underperforming?

Format response EXACTLY as:
ADVICE: [detailed pricing advice, 2-3 sentences]
PRICE: [recommended price number only]
RISK: [low | medium | high]`
    });

    const result = await model.generateContent('Analyze the pricing for this event.');
    const text = result.response.text();

    const adviceMatch = text.match(/ADVICE:\s*([\s\S]*?)(?=\nPRICE:|\nRISK:)/i);
    const priceMatch = text.match(/PRICE:\s*(\d+)/i);
    const riskMatch = text.match(/RISK:\s*(\w+)/i);

    return {
      advice: adviceMatch ? adviceMatch[1].trim() : text,
      recommendedPrice: priceMatch ? Number(priceMatch[1]) : event.price,
      riskLevel: riskMatch ? riskMatch[1].toLowerCase() : 'medium'
    };
  } catch (error: any) {
    console.error('Pricing advisor error:', error);
    throw new Error(error.message || 'Failed to get pricing advice');
  }
};

// ===== Feature #7: AI Booking Confirmation Assistant =====
export const getBookingAssistant = async (
  eventId: string,
  seats: number
): Promise<{ message: string; tips: string[] }> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const event = await Event.findById(eventId).lean().exec();
    if (!event) {
      throw new Error('Event not found');
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a booking confirmation assistant for EventHub.
Event: ${event.title}
Category: ${event.category}
Date: ${new Date(event.date).toLocaleDateString()}
Time: ${event.time}
Location: ${event.location}
Price: $${event.price}
Seats Booked: ${seats}
Total: $${event.price * seats}

Generate a friendly booking confirmation message and 3-4 practical preparation tips for the attendee.

Format response EXACTLY as:
MESSAGE: [friendly confirmation message, 2-3 sentences]
TIPS: [comma-separated list of 3-4 preparation tips]`
    });

    const result = await model.generateContent('Generate booking confirmation and tips.');
    const text = result.response.text();

    const messageMatch = text.match(/MESSAGE:\s*([\s\S]*?)(?=\nTIPS:)/i);
    const tipsMatch = text.match(/TIPS:\s*([\s\S]*)/i);

    return {
      message: messageMatch ? messageMatch[1].trim() : text,
      tips: tipsMatch
        ? tipsMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
        : []
    };
  } catch (error: any) {
    console.error('Booking assistant error:', error);
    throw new Error(error.message || 'Failed to generate booking assistant');
  }
};

// ===== Feature #8: AI Demand Forecasting Dashboard =====
export const getDemandForecast = async (): Promise<{
  forecast: string;
  sellOutRisks: { eventId: string; title: string; risk: string }[];
}> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const events = await fetchAllEvents();
    const eventDocs = await Event.find().lean().exec();

    const eventStats = eventDocs.map((doc: any) => {
      const demandRatio = doc.capacity > 0 ? (doc.capacity - doc.availableSeats) / doc.capacity : 0;
      const daysUntil = Math.max(0, Math.ceil((new Date(doc.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      return {
        id: String(doc._id),
        title: doc.title,
        category: doc.category,
        price: doc.price,
        demandRatio: Math.round(demandRatio * 100),
        daysUntil,
        availableSeats: doc.availableSeats,
        capacity: doc.capacity
      };
    });

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings,
      systemInstruction: `You are "EventAI", a demand forecasting analyst for EventHub.
EVENT DATA:
${eventStats.map((e) => `- ${e.title} (ID: ${e.id}) | Category: ${e.category} | Price: $${e.price} | Demand: ${e.demandRatio}% | Days until: ${e.daysUntil} | Seats left: ${e.availableSeats}/${e.capacity}`).join('\n')}

Analyze the booking momentum and provide:
1. A forecast of which events are likely to sell out soon.
2. Which events need attention (low demand, high capacity).
3. Overall platform health assessment.

Format response EXACTLY as:
FORECAST: [overall forecast, 2-3 sentences]
SELLOUT_RISKS: [comma-separated list of event IDs at risk of selling out, or NONE]`
    });

    const result = await model.generateContent('Analyze demand and forecast sell-out risks.');
    const text = result.response.text();

    const forecastMatch = text.match(/FORECAST:\s*([\s\S]*?)(?=\nSELLOUT_RISKS:)/i);
    const risksMatch = text.match(/SELLOUT_RISKS:\s*([\s\S]*)/i);

    const sellOutRisks: { eventId: string; title: string; risk: string }[] = [];
    if (risksMatch) {
      const riskPart = risksMatch[1].trim();
      if (riskPart.toUpperCase() !== 'NONE') {
        const ids = riskPart.split(',').map((s) => s.trim());
        ids.forEach((id) => {
          if (/^[a-fA-F0-9]{24}$/.test(id)) {
            const event = eventStats.find((e) => e.id === id);
            if (event) {
              sellOutRisks.push({
                eventId: id,
                title: event.title,
                risk: `High demand (${event.demandRatio}%) with ${event.availableSeats} seats left`
              });
            }
          }
        });
      }
    }

    return {
      forecast: forecastMatch ? forecastMatch[1].trim() : text,
      sellOutRisks
    };
  } catch (error: any) {
    console.error('Demand forecast error:', error);
    throw new Error(error.message || 'Failed to generate demand forecast');
  }
};
