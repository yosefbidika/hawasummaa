import { account, ID } from "../lib/appwrite";

// Register User
export async function registerUser(name, email, password) {
  try {
    // Create account
    await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Automatically login after registration
    await account.createEmailPasswordSession(
      email,
      password
    );

    // Get current user
    const user = await account.get();

    return {
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Login User
export async function loginUser(email, password) {
  try {
    await account.createEmailPasswordSession(
      email,
      password
    );

    const user = await account.get();

    return {
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Logout User
export async function logoutUser() {
  try {
    await account.deleteSession("current");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const user = await account.get();

    return {
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}