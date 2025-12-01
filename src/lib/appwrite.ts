import { Client, Databases, Query, ID } from 'appwrite';

export const client = new Client()
  .setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

// Server-only client (for API routes & Appwrite Functions)
export const serverClient = () =>
  new Client()
    .setEndpoint(import.meta.env.APPWRITE_ENDPOINT)
    .setProject(import.meta.env.APPWRITE_PROJECT_ID)
    .setKey(import.meta.env.APPWRITE_API_KEY);

export { Query, ID };
