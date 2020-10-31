import { Router } from 'express';
import PlayersRouter from './players';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/players', PlayersRouter);

// Export the base-router
export default router;
