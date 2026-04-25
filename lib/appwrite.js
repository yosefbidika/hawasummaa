import { Client, Account, Databases, ID, Query } from "appwrite";

// create client instance (lowercase)
const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69995d8000271ae62a8c');

// services
export const account = new Account(client);
export const databases = new Databases(client);

// exports
export { ID, Query };

export const DATABASE_ID = '69995ee300391ddbc4a0';

export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments'
};
