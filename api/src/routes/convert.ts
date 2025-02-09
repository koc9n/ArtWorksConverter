import { Router } from 'express';
import { ConversionController } from '../controllers/conversion.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new ConversionController();

// Protected routes - require authentication
router.use(authMiddleware);


// History routes - place these before the :jobId route
router.get('/history', controller.getHistory);
router.delete('/history/:jobId', controller.deleteFromHistory);

// Conversion routes
router.post('/', 
  uploadMiddleware,
  controller.convert
);
router.get('/:jobId', controller.getStatus);




export const convertRouter = router; 