import { Response } from 'express';
import Event from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from './activityController';

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await Event.find().populate('organizer', 'name email');
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json(event);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user?._id,
      availableSeats: req.body.capacity
    });

    
    try {
      await logActivity({
        user: req.user,
        action: 'event_created',
        description: `Created event "${event.title}"`,
        eventId: event._id.toString(),
        eventTitle: event.title,
        metadata: { category: event.category, price: event.price }
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }

    res.status(201).json(event);
  } catch (error: any) {
    console.error('Event creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    if (event.organizer.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    
    try {
      await logActivity({
        user: req.user,
        action: 'event_updated',
        description: `Updated event "${event.title}"`,
        eventId: event._id.toString(),
        eventTitle: event.title
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Event update error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    if (event.organizer.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    
    try {
      await logActivity({
        user: req.user,
        action: 'event_deleted',
        description: `Deleted event "${event.title}"`,
        eventId: event._id.toString(),
        eventTitle: event.title
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error: any) {
    console.error('Event deletion error:', error);
    res.status(500).json({ message: error.message });
  }
};
