import { account, ID } from "../lib/appwrite";

export async function registerUser(name, email, password) {
  try {
    const user = await account.create(ID.unique(), email, password, name);

    return {
      success: true,
      userId: user.$id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function loginUser(email, password) {
  try {
    await account.createEmailPasswordSession(email, password);

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

export async function logoutUser() {
  try {
    await account.deleteSession("current");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

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
  } catch {
    return { success: false };
  }
}