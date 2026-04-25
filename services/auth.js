import { account, ID } from '../lib/appwrite';

export async function registerUser(name, email, password) {
  try {
    console.log("Registering user:", email);

    // Log out any active session first
    try {
      await account.deleteSession('current');
      console.log("Existing session cleared before registration");
    } catch (e) {
      console.log("No existing session to clear:", e.message);
    }

    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    console.log("User Created successfully:", user);

    // Login after registration
    await loginUser(email, password);

    return { success: true, UserId: user.$id };
  } catch (error) {
    console.log("registration error:", error.message);
    return {
      success: false,
      error: error.message || "Registration failed. Try a different email or password."
    };
  }
}

export async function loginUser(email, password) {
  try {
    console.log("Logging in user:", email);

    // Log out any active session first
    try {
      await account.deleteSession('current');
      console.log("Existing session cleared before login");
    } catch (e) {
      console.log("No existing session to clear:", e.message);
    }

    const session = await account.createEmailPasswordSession(email, password);
    console.log("Session created:", session.$id);

    const user = await account.get();
    console.log("logged in as:", user.name, user.email);

    return {
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.log("login error:", error.message);
    return {
      success: false,
      error: error.message || "Login failed. Please check your email/password."
    };
  }
}

// Logout, getCurrentUser, checkAuth remain the same
export async function logoutUser() {
  try {
    await account.deleteSession('current');
    console.log("User logged out successfully");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Logout failed. Please try again."
    };
  }
}

export async function getCurrentUser() {
  try {
    const user = await account.get();
    console.log("Current user:", user.name, user.email);
    return {
      success: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.log("No user logged in:", error.message);
    return {
      success: false,
      error: "No user logged in."
    };
  }
}

export async function checkAuth() {
  try {
    const user = await account.get();
    console.log("User is authenticated:", user.name, user.email);
    return {
      authenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      }
    };
  } catch (error) {
    console.log("User is not authenticated:", error.message);
    return {
      authenticated: false,
      error: "User is not authenticated."
    };
  }
}