import { Router } from 'express';
import { Movie } from '../db/models';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// All routes require Auth
router.use(authenticateJWT);

// Get all movies for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const movies = await Movie.find({ user: req.userId }).sort({ watchedDate: -1 });
    res.json(movies);
  } catch {
    res.status(500).json({ message: 'Failed to get movies' });
  }
});

// Add new movie
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, watchedDate, rating, genres, tags, director, actors, notes, posterUrl } = req.body;
    if (!title || !watchedDate || !rating || !genres || !director || !actors) {
      return res.status(400).json({ message: 'Missing required movie fields' });
    }
    const movie = await Movie.create({
      user: req.userId,
      title,
      watchedDate,
      rating,
      genres,
      tags,
      director,
      actors,
      notes,
      posterUrl
    });
    res.status(201).json(movie);
  } catch {
    res.status(500).json({ message: 'Failed to add movie' });
  }
});

// Update a movie
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const movie = await Movie.findOneAndUpdate(
      { _id: id, user: req.userId },
      update,
      { new: true }
    );
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch {
    res.status(500).json({ message: 'Failed to update movie' });
  }
});

// Delete a movie
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const deleted = await Movie.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Movie not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Failed to delete movie' });
  }
});

export default router;
