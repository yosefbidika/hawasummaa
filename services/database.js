import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "../lib/appwrite";

// CREATE POST
export async function createPost(
  userId,
  userEmail,
  userName,
  content,
  imageUrl = '',
  imageId = ''
) {
  try {
    console.log('Creating post with content:', content);

    const postData = {
      userId,
      UserEmail: userEmail,
      UserName: userName,
      content,
    };

    // ✅ FIXED: attach image to postData
    if (imageUrl) {
      postData.imageUrl = imageUrl;
      postData.imageId = imageId;
    }

    const post = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      ID.unique(),
      postData
    );

    return { success: true, post };

  } catch (error) {
    return { success: false, error: error.message };
  }
}


// GET POSTS
export async function getAllposts() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      [Query.orderDesc("$createdAt")]
    );

    return response.documents;

  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}


// DELETE POST
export async function deletepost(postId) {
  try {
    console.log(`Deleting post with ID: ${postId}`);

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      postId
    );

    console.log(`Post deleted successfully`);

    return { success: true };

  } catch (error) {
    console.error(`Error deleting post:`, error);
    return { success: false, error: error.message };
  }
}
// =========================
// COMMENTS
// =========================

// CREATE COMMENT
export async function addComment(
  postId,
  userId,
  userName,
  userEmail,
  content
) {
  try {
    const comment = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      ID.unique(),
      {
        PostId: postId,
        userId,
        UserName: userName,
        UserEmail: userEmail,
        content
      }
    );

    return { success: true, comment };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// GET COMMENTS
export async function getComments(postId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      [
        Query.equal('PostId', postId),
        Query.orderDesc('$createdAt')
      ]
    );

    return response.documents;

  } catch (error) {
    console.error(error);
    return [];
  }
}
// =========================
// LIKES
// =========================

// LIKE POST
export async function likePost(
  postId,
  userId,
  userName
) {
  try {

    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LIKES,
      [
        Query.equal('postId', postId),
        Query.equal('userId', userId)
      ]
    );

    // already liked
    if (existing.documents.length > 0) {
      return {
        success: true,
        alreadyLiked: true
      };
    }

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LIKES,
      ID.unique(),
      {
        postId,
        userId,
        UserName: userName
      }
    );

    return {
      success: true,
      alreadyLiked: false
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// GET LIKE COUNT
export async function getLikes(postId) {
  try {

    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LIKES,
      [
        Query.equal('postId', postId)
      ]
    );

    return response.documents.length;

  } catch (error) {
    console.error(error);
    return 0;
  }
}