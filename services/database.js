import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "../lib/appwrite";

// CREATE POST
export async function createPost(userId, userEmail, userName, content) {
  try {
    const post = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.POSTS,
      ID.unique(),
      {
        userId,
        UserEmail: userEmail,
        UserName: userName,
        content,
      }
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

    return response.documents; // VERY IMPORTANT

  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // prevent crash
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

    console.log(`Post with ID ${postId} deleted successfully`);

    return { success: true };
  } catch (error) {
    console.error(`Error deleting post with ID ${postId}:`, error);

    return { success: false, error: error.message };
  }
}