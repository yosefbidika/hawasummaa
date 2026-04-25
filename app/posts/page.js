'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/auth';
import { createPost, getAllposts, deletepost } from '@/services/database';

export default function PostsPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      if (!res.success) {
        setError('You must be logged in.');
        return;
      }
      setUser(res.user);
      await fetchPosts();
    } catch {
      setError('Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await getAllposts();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load posts.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setPosting(true);
    setError('');

    try {
      const res = await createPost(
        user.id,
        user.email,
        user.name,
        content
      );

      if (res.success) {
        setContent('');
        await fetchPosts();
      } else {
        setError(res.error || 'Failed to create post');
      }
    } catch {
      setError('Error creating post');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (post) => {
    const ownerId = post.userId || post.UserId;

    if (ownerId !== user.id) return;

    if (!window.confirm('Delete this post?')) return;

    try {
      const res = await deletepost(post.$id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.$id !== post.$id));
      }
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>{error || 'Not logged in'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-gray-400 text-sm">
            {user.name} ({user.email})
          </p>
        </div>

        {/* CREATE POST FORM */}
        <form
          onSubmit={handleCreate}
          className="bg-gray-900 p-4 rounded-xl mb-6 shadow-lg"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full h-24 p-3 rounded-lg bg-gray-800 text-white outline-none resize-none"
          />

          {/* POST BUTTON */}
          <button
            type="submit"
            disabled={posting}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '10px'
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* POSTS */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center">No posts yet</p>
          ) : (
            posts.map((post) => {
              const ownerId = post.userId || post.UserId;
              const isOwner = ownerId === user.id;

              return (
                <div
                  key={post.$id}
                  className="bg-gray-900 p-4 rounded-xl shadow hover:shadow-lg transition"
                >
                  <p className="mb-2 text-lg">
                    {post.Content || post.content}
                  </p>

                  <div className="text-xs text-gray-400">
                    By {post.UserName} •{' '}
                    {new Date(post.$createdAt).toLocaleString()}
                  </div>

                  {/* DELETE BUTTON */}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(post)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginTop: '10px'
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = '#dc2626')}
                      onMouseOut={(e) => (e.target.style.backgroundColor = '#ef4444')}
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}