import { useEffect, useState } from "react";
import { useAuth } from "../App";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Movie {
  _id: string;
  title: string;
  watchedDate: string;
  rating: number;
  genres: string[];
  tags?: string[];
  director: string;
  actors: string[];
  notes?: string;
  posterUrl?: string;
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add movie form states
  const [title, setTitle] = useState("");
  const [watchedDate, setWatchedDate] = useState("");
  const [rating, setRating] = useState("");
  const [genres, setGenres] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [director, setDirector] = useState("");
  const [actors, setActors] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit movie states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>({});

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  async function fetchMovies() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setMovies(data);
    } catch (_) {
      setError("Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchMovies();
    // eslint-disable-next-line
  }, [token]);

  async function handleAddMovie(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const movie = {
        title,
        watchedDate,
        rating: Number(rating),
        genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        director,
        actors: actors.split(",").map((a) => a.trim()).filter(Boolean),
        notes,
        posterUrl,
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(movie),
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error("Failed to add movie");
      setTitle("");
      setWatchedDate("");
      setRating("");
      setGenres("");
      setTags("");
      setDirector("");
      setActors("");
      setNotes("");
      setPosterUrl("");
      setSubmitMsg("Movie added!");
      fetchMovies();
    } catch (e) {
      setSubmitMsg("Could not add movie.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(""), 1500);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete movie");
      fetchMovies();
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(mov: Movie) {
    setEditingId(mov._id);
    setEditFields({
      title: mov.title,
      watchedDate: mov.watchedDate ? mov.watchedDate.slice(0, 10) : "",
      rating: String(mov.rating),
      genres: mov.genres.join(", "),
      tags: mov.tags ? mov.tags.join(", ") : "",
      director: mov.director,
      actors: mov.actors.join(", "),
      notes: mov.notes || "",
      posterUrl: mov.posterUrl || "",
    });
  }

  function updateEditField(field: string, val: string) {
    setEditFields((f: any) => ({ ...f, [field]: val }));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditFields({});
  }

  async function submitEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    try {
      const updated = {
        ...editFields,
        rating: Number(editFields.rating),
        genres: editFields.genres.split(",").map((g: string) => g.trim()).filter(Boolean),
        tags: editFields.tags ? editFields.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        actors: editFields.actors.split(",").map((a: string) => a.trim()).filter(Boolean),
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      setEditFields({});
      fetchMovies();
    } catch (err) {
      alert("Update failed, please try again.");
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cinemate Dashboard</h1>
        <button className="px-4 py-2 bg-zinc-300 rounded hover:bg-zinc-400" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Add movie form */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a Movie</h2>
        <form className="space-y-3" onSubmit={handleAddMovie}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Date Watched</Label>
              <Input type="date" value={watchedDate} onChange={(e) => setWatchedDate(e.target.value)} required />
            </div>
            <div>
              <Label>Rating</Label>
              <Input type="number" min={1} max={10} value={rating} onChange={(e) => setRating(e.target.value)} required />
            </div>
            <div>
              <Label>
                Genres <span className="text-xs">(comma separated)</span>
              </Label>
              <Input value={genres} onChange={(e) => setGenres(e.target.value)} required />
            </div>
            <div>
              <Label>
                Tags <span className="text-xs">(optional, comma separated)</span>
              </Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div>
              <Label>Director</Label>
              <Input value={director} onChange={(e) => setDirector(e.target.value)} required />
            </div>
            <div>
              <Label>
                Actors <span className="text-xs">(comma separated)</span>
              </Label>
              <Input value={actors} onChange={(e) => setActors(e.target.value)} required />
            </div>
            <div>
              <Label>
                Poster URL <span className="text-xs">(optional)</span>
              </Label>
              <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>
              Notes <span className="text-xs">(optional)</span>
            </Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Movie"}
          </Button>
          {submitMsg && <div className="text-green-600 text-sm mt-2">{submitMsg}</div>}
        </form>
      </Card>

      {/* Movie list */}
      <div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {movies.length === 0 && !loading && <div>No movies logged yet!</div>}
        <div className="grid gap-5">
          {movies.map((mov) => (
            <Card key={mov._id} className="p-5 flex gap-5">
              {mov.posterUrl && (
                <img src={mov.posterUrl} alt="poster" className="w-24 h-36 object-cover rounded shadow" />
              )}
              <div className="flex-1">
                {editingId === mov._id ? (
                  <form className="grid gap-2" onSubmit={(e) => submitEdit(e, mov._id)}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input value={editFields.title} onChange={(e) => updateEditField("title", e.target.value)} required />
                      </div>
                      <div>
                        <Label>Date Watched</Label>
                        <Input
                          type="date"
                          value={editFields.watchedDate}
                          onChange={(e) => updateEditField("watchedDate", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Rating</Label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={editFields.rating}
                          onChange={(e) => updateEditField("rating", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Genres</Label>
                        <Input value={editFields.genres} onChange={(e) => updateEditField("genres", e.target.value)} required />
                      </div>
                      <div>
                        <Label>Tags</Label>
                        <Input value={editFields.tags} onChange={(e) => updateEditField("tags", e.target.value)} />
                      </div>
                      <div>
                        <Label>Director</Label>
                        <Input value={editFields.director} onChange={(e) => updateEditField("director", e.target.value)} required />
                      </div>
                      <div>
                        <Label>Actors</Label>
                        <Input value={editFields.actors} onChange={(e) => updateEditField("actors", e.target.value)} required />
                      </div>
                      <div>
                        <Label>Poster URL</Label>
                        <Input value={editFields.posterUrl} onChange={(e) => updateEditField("posterUrl", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input value={editFields.notes} onChange={(e) => updateEditField("notes", e.target.value)} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="font-bold text-xl">{mov.title}</h3>
                    <p className="text-sm text-zinc-600">
                      Watched {mov.watchedDate ? new Date(mov.watchedDate).toLocaleDateString() : ""}
                    </p>
                    <p>
                      🎬 {mov.director} | ⭐ {mov.rating}/10
                    </p>
                    <div>
                      <span className="font-semibold">Genres:</span> {mov.genres.join(", ")}
                    </div>
                    {mov.tags && mov.tags.length > 0 && (
                      <div>
                        <span className="font-semibold">Tags:</span> {mov.tags.join(", ")}
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">Actors:</span> {mov.actors.join(", ")}
                    </div>
                    {mov.notes && (
                      <div>
                        <span className="font-semibold">Notes:</span> {mov.notes}
                      </div>
                    )}
                    <div className="flex mt-3 gap-2">
                      <Button size="sm" variant="default" onClick={() => startEdit(mov)} disabled={!!editingId}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDelete(mov._id)}
                        disabled={deletingId === mov._id}
                      >
                        {deletingId === mov._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}