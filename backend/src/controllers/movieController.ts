import { Request, Response } from 'express';
import Movie from '../models/Movie';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const getMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const movies = await Movie.find({ userId: req.user?.id });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    title,
    watchedDate,
    rating,
    genres,
    tags,
    director,
    actors,
    notes,
    posterUrl,
  } = req.body;

  try {
    const movie = new Movie({
      userId: req.user?.id,
      title,
      watchedDate,
      rating,
      genres,
      tags,
      director,
      actors,
      notes,
      posterUrl,
    });

    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const movie = await Movie.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      updates,
      { new: true }
    );

    if (!movie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const movie = await Movie.findOneAndDelete({ _id: id, userId: req.user?.id });

    if (!movie) {
      res.status(404).json({ message: 'Movie not found' });
      return;
    }

    res.json({ message: 'Movie deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
