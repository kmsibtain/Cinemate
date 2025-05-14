import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "../App";

const initialMovie = {
  title: "",
  watchedDate: "",
  rating: 5,
  genres: "",
  tags: "",
  director: "",
  actors: "",
  notes: "",
  posterUrl: "",
};

export default function Dashboard() {
  const { logout, token } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [movie, setMovie] = useState(initialMovie);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  async function fetchMovies() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:4000/movies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data = await res.json();
      setMovies(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, []);

  async function handleAddMovie(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAddSuccess(false);
    try {
      // Prepare the input for API
      const data = {
        ...movie,
        actors: movie.actors.split(",").map((s) => s.trim()).filter(Boolean),
        genres: movie.genres.split(",").map((s) => s.trim()).filter(Boolean),
        tags: movie.tags ? movie.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
        watchedDate: movie.watchedDate ? new Date(movie.watchedDate) : undefined,
        rating: Number(movie.rating),
      };
      const res = await fetch("http://localhost:4000/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add movie");
      setMovie(initialMovie);
      setAddSuccess(true);
      fetchMovies();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => setAddSuccess(false), 1500);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cinemate Dashboard</h1>
        <button className="px-4 py-2 bg-zinc-300 rounded hover:bg-zinc-400" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a Movie</h2>
        <form onSubmit={handleAddMovie} className="grid grid-cols-1 gap-2">
          <div>
            <Label>Title</Label>
            <Input value={movie.title} onChange={e => setMovie({ ...movie, title: e.target.value })} required />
          </div>
          <div>
            <Label>Date Watched</Label>
            <Input type="date" value={movie.watchedDate} onChange={e => setMovie({ ...movie, watchedDate: e.target.value })} required />
          </div>
          <div>
            <Label>Your Rating (1-10)</Label>
            <Input type="number" min={1} max={10} value={String(movie.rating)} onChange={e => setMovie({ ...movie, rating: Number(e.target.value) })} required />
          </div>
          <div>
            <Label>Genres (comma separated)</Label>
            <Input value={movie.genres} onChange={e => setMovie({ ...movie, genres: e.target.value })} required />
          </div>
          <div>
            <Label>Tags (optional, comma separated)</Label>
            <Input value={movie.tags} onChange={e => setMovie({ ...movie, tags: e.target.value })} />
          </div>
          <div>
            <Label>Director</Label>
            <Input value={movie.director} onChange={e => setMovie({ ...movie, director: e.target.value })} required />
          </div>
          <div>
            <Label>Actors (comma separated)</Label>
            <Input value={movie.actors} onChange={e => setMovie({ ...movie, actors: e.target.value })} required />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Input value={movie.notes} onChange={e => setMovie({ ...movie, notes: e.target.value })} />
          </div>
          <div>
            <Label>Poster URL (optional)</Label>
            <Input value={movie.posterUrl} onChange={e => setMovie({ ...movie, posterUrl: e.target.value })} />
          </div>
          <Button type="submit" className="mt-4" disabled={loading}>
            {loading ? "Saving..." : "Add Movie"}
          </Button>
          {addSuccess && <p className="text-green-600">Movie added!</p>}
          {error && <p className="text-red-600">{error}</p>}
        </form>
      </Card>
      <h3 className="text-xl font-semibold mb-4">Your Movies</h3>
      {loading && <div>Loading...</div>}
      {!loading && movies.length === 0 && <div>No movies logged yet.</div>}
      <div className="grid gap-4">
        {movies.map((m) => (
          <Card key={m._id} className="p-4 flex items-center gap-4">
            {m.posterUrl && <img src={m.posterUrl} alt="Poster" className="w-20 h-28 object-cover rounded mr-4" />}
            <div className="flex-1">
              <div className="font-bold text-lg">{m.title} <span className="font-normal text-sm text-zinc-400">({new Date(m.watchedDate).getFullYear()})</span></div>
              <div className="text-sm text-zinc-500 mb-1">Rating: <b>{m.rating}</b> / 10</div>
              <div className="text-xs text-zinc-500 mb-2">{m.genres.join(", ")}</div>
              <div className="text-xs text-zinc-400">Directed by: {m.director}</div>
              <div className="text-xs text-zinc-400 mb-1">Actors: {m.actors.join(", ")}</div>
              {m.tags.length > 0 && <div className="text-xs">Tags: {m.tags.join(", ")}</div>}
              {m.notes && <div className="text-sm mt-2 italic">{m.notes}</div>}
            </div>
            {/* Edit/Delete coming soon */}
          </Card>
        ))}
      </div>
    </div>
  );
}
