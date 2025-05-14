import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMovies, addMovie, updateMovie, deleteMovie } from '../controllers/movieController';

const router = Router();

router.use(authMiddleware);
router.get('/', getMovies);
router.post('/', addMovie);
router.put('/:id', updateMovie);
router.delete('/:id', deleteMovie);

export default router;