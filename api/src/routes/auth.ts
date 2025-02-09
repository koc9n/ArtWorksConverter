import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/logout', authMiddleware, controller.logout);
router.get('/profile', authMiddleware, controller.getProfile);
router.get('/validate', authMiddleware, controller.validateToken);

export const authRouter = router; 