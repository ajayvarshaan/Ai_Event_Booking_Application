import express from 'express';
import { 
  getAllActivities, 
  getRecentActivities, 
  getUserActivities,
  getActivityStats 
} from '../controllers/activityController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();


router.get('/all', protect, admin, getAllActivities);
router.get('/recent', protect, admin, getRecentActivities);
router.get('/stats', protect, admin, getActivityStats);
router.get('/user/:userId', protect, admin, getUserActivities);

export default router;
