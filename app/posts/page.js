'use client';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/auth';
import {
  createPost,
  getAllposts,
  deletepost,
  likePost,
  addComment,
  getLikes,
  getComments,
  hasLiked
} from '@/services/database';
import ImageUpload from '@/component/imageUpload';

export default function PostsPage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageId, setImageId] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // comment state
  const [commentText, setCommentText] = useState({});
  const [openComment, setOpenComment] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});

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
await fetchPosts(res.user);
    } catch {
      setError('Failed to load user.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (currentUser = user) => {
  try {
    const data = await getAllposts();

    const postsWithCounts = await Promise.all(
      data.map(async (post) => {
        const likes = await getLikes(post.$id);
        const comments = await getComments(post.$id);
        const liked = currentUser
          ? await hasLiked(post.$id, currentUser.id)
          : false;

        return {
          ...post,
          likesCount: likes,
          commentsCount: comments.length,
          liked,
        };
      })
    );

    setPosts(postsWithCounts);

    const likedMap = {};

    postsWithCounts.forEach((post) => {
      likedMap[post.$id] = post.liked;
    });

    setLikedPosts(likedMap);

  } catch (error) {
    console.error(error);
    setError('Failed to load posts.');
  }
};
  const handleCreate = async (e) => {
    e.preventDefault();

    if ((!content.trim() && !imageUrl) || !user) return;

    setPosting(true);
    setError('');

    try {
      const res = await createPost(
        user.id,
        user.email,
        user.name,
        content,
        imageUrl,
        imageId
      );

      if (res.success) {
        setContent('');
        setImageUrl('');
        setImageId('');
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

  const handleLike = async (post) => {
    const res = await likePost(post.$id, user.id, user.name);

    if (!res.success) {
      console.error(res.error);
      return;
    }

    // Update the like count in the UI
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.$id === post.$id) {
          return {
            ...p,
            likesCount: res.alreadyLiked
              ? (p.likesCount || 0) - 1
              : (p.likesCount || 0) + 1
          };
        }
        return p;
      })
    );

    // Track if current user liked the post
    setLikedPosts((prev) => ({
      ...prev,
      [post.$id]: !res.alreadyLiked
    }));
  };

  // COMMENT HANDLER
  const handleComment = async (postId) => {
    const text = commentText[postId];

    if (!text?.trim()) return;

    const res = await addComment(
      postId,
      user.id,
      user.name,
      user.email,
      text
    );

    if (!res.success) {
      console.error(res.error);
      alert(res.error || 'Comment failed');
      return;
    }

    // Update comment count
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.$id === postId) {
          return {
            ...p,
            commentsCount: (p.commentsCount || 0) + 1
          };
        }
        return p;
      })
    );

    // clear only this post's comment
    setCommentText((prev) => ({
      ...prev,
      [postId]: ''
    }));

    // refresh posts so comments appear
    await fetchPosts();
  };

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/posts/${post.$id}`;
    await navigator.clipboard.writeText(shareUrl);
    
    // Track share count
    try {
      // Update share count in UI
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.$id === post.$id) {
            return {
              ...p,
              sharesCount: (p.sharesCount || 0) + 1
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error tracking share:', error);
    }
    
    alert('Link copied!');
  };

  const handleImageUpload = (url, id) => {
    setImageUrl(url);
    setImageId(id);
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

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-gray-400 text-sm">
            {user.name} ({user.email})
          </p>
        </div>

        {/* CREATE POST */}
        <form onSubmit={handleCreate} className="bg-gray-900 p-4 rounded-xl mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full h-24 p-3 rounded-lg bg-gray-800 text-white"
          />

          <ImageUpload userId={user.id} onUpload={handleImageUpload} />

          <button
            type="submit"
            disabled={posting}
            className="mt-3 bg-blue-500 px-4 py-2 rounded"
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
              const text = post.Content || post.content;
              const name = post.UserName || post.userName;
              const image = post.imageUrl || post.ImageUrl;
              const likesCount = post.likesCount || 0;
              const commentsCount = post.commentsCount || 0;
              const sharesCount = post.sharesCount || 0;

              return (
                <div key={post.$id} className="bg-gray-900 p-4 rounded-xl">

                  <p className="text-lg">{text}</p>

                  <div className="text-xs text-gray-400">
                    By {name} • {new Date(post.$createdAt).toLocaleString()}
                  </div>

                  {image && (
                    <img
                      src={image}
                      className="mt-3 rounded-lg max-h-[300px]"
                    />
                  )}

                  {/* COUNTS - PUBLIC DISPLAY */}
                  <div className="flex gap-6 mt-3 text-sm text-gray-400">
                    <span>❤️ {likesCount}</span>
                    <span>💬 {commentsCount}</span>
                    <span>🔗 {sharesCount}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-4 mt-3 text-sm">

                    <button 
                      onClick={() => handleLike(post)}
                      className={likedPosts[post.$id] ? 'text-blue-400' : 'text-gray-400'}
                    >
                      {likedPosts[post.$id] ? '❤️ Liked' : '👍 Like'}
                    </button>

                    <button onClick={() =>
                      setOpenComment(openComment === post.$id ? null : post.$id)
                    }>
                      💬 Comment
                    </button>

                    <button onClick={() => handleShare(post)}>
                      🔗 Share
                    </button>

                  </div>

                  {/* COMMENT BOX */}
                  {openComment === post.$id && (
                    <div className="mt-3">
                      <input
                        value={commentText[post.$id] || ''}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.$id]: e.target.value
                          })
                        }
                        placeholder="Write a comment..."
                        className="w-full p-2 bg-gray-800 rounded"
                      />

                      <button
                        onClick={() => handleComment(post.$id)}
                        className="mt-2 bg-blue-500 px-3 py-1 rounded"
                      >
                        Post Comment
                      </button>
                    </div>
                  )}

                  {/* DELETE */}
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(post)}
                      className="mt-3 text-red-400"
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