import { Response } from 'express';
import Booking from '../models/Booking';
import Event from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from './activityController';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, seats } = req.body;
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    if (event.availableSeats < seats) {
      res.status(400).json({ message: 'Not enough seats' });
      return;
    }

    const booking = await Booking.create({
      event: eventId,
      user: req.user?._id,
      seats,
      totalPrice: event.price * seats
    });

    event.availableSeats -= seats;
    await event.save();

    
    try {
      await logActivity({
        user: req.user,
        action: 'booking_created',
        description: `Booked ${seats} seat(s) for "${event.title}"`,
        eventId: event._id.toString(),
        eventTitle: event.title,
        bookingId: booking._id.toString(),
        metadata: { seats, totalPrice: booking.totalPrice }
      });
    } catch (activityError) {
      console.error('Activity logging failed:', activityError);
      
    }

    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ user: req.user?._id }).populate('event');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find()
      .populate('event')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } })
      .populate('user', 'name email')
      .populate('event', 'title');

    
    const userMap = new Map();
    bookings.forEach((booking: any) => {
      
      if (!booking.event || !booking.user) return;
      
      const userId = booking.user._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          _id: userId,
          userName: booking.user.name,
          userEmail: booking.user.email,
          totalBookings: 0,
          totalSeats: 0,
          totalSpent: 0,
          events: []
        });
      }
      const userStat = userMap.get(userId);
      userStat.totalBookings += 1;
      userStat.totalSeats += booking.seats;
      userStat.totalSpent += booking.totalPrice;
      userStat.events.push({
        eventTitle: booking.event.title,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        bookingDate: booking.createdAt
      });
    });

    const stats = Array.from(userMap.values()).sort((a: any, b: any) => b.totalSpent - a.totalSpent);
    console.log('Active bookings stats:', stats);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching user booking stats:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getCanceledBookingStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await Booking.find({ status: 'cancelled' })
      .populate('user', 'name email')
      .populate('event', 'title');

    
    const userMap = new Map();
    bookings.forEach((booking: any) => {
      
      if (!booking.event || !booking.user) return;
      
      const userId = booking.user._id.toString();
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          _id: userId,
          userName: booking.user.name,
          userEmail: booking.user.email,
          totalCanceled: 0,
          totalSeats: 0,
          totalRefunded: 0,
          events: []
        });
      }
      const userStat = userMap.get(userId);
      userStat.totalCanceled += 1;
      userStat.totalSeats += booking.seats;
      userStat.totalRefunded += booking.totalPrice;
      userStat.events.push({
        eventTitle: booking.event.title,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        canceledDate: booking.updatedAt
      });
    });

    const stats = Array.from(userMap.values()).sort((a: any, b: any) => b.totalRefunded - a.totalRefunded);
    console.log('Canceled bookings stats:', stats);
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching canceled booking stats:', error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.user.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const event = await Event.findById(booking.event);
    if (event) {
      event.availableSeats += booking.seats;
      await event.save();

      
      try {
        await logActivity({
          user: req.user,
          action: 'booking_cancelled',
          description: `Cancelled booking for "${event.title}"`,
          eventId: event._id.toString(),
          eventTitle: event.title,
          bookingId: booking._id.toString(),
          metadata: { seats: booking.seats }
        });
      } catch (activityError) {
        console.error('Activity logging failed:', activityError);
        
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (error: any) {
    console.error('Booking cancellation error:', error);
    res.status(500).json({ message: error.message });
  }
};
