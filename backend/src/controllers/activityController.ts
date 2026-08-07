import { Request, Response } from 'express';
import Activity from '../models/Activity';


export const logActivity = async (data: {
  user: any;
  action: string;
  description: string;
  eventId?: string;
  eventTitle?: string;
  bookingId?: string;
  metadata?: any;
}) => {
  try {
    console.log('Logging activity:', data);
    const activity = await Activity.create({
      user: data.user._id,
      userName: data.user.name,
      userEmail: data.user.email,
      action: data.action,
      description: data.description,
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      bookingId: data.bookingId,
      metadata: data.metadata
    });
    console.log('Activity logged successfully:', activity._id);
    return activity;
  } catch (error) {
    console.error('Failed to log activity:', error);
    throw error;
  }
};


export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('eventId', 'title');

    const total = await Activity.countDocuments();

    res.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent activities (admin only)
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    console.log('Fetching recent activities, limit:', limit);

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate('eventId', 'title');

    console.log('Found activities:', activities.length);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
};

// Get activities by user
export const getUserActivities = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('eventId', 'title');

    const total = await Activity.countDocuments({ user: userId });

    res.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const getActivityStats = async (req: Request, res: Response) => {
  try {
    const stats = await Activity.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalActivities = await Activity.countDocuments();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayActivities = await Activity.countDocuments({
      createdAt: { $gte: todayStart }
    });

    res.json({
      stats,
      totalActivities,
      todayActivities
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
