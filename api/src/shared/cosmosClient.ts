import { CosmosClient, type Container } from '@azure/cosmos';

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const databaseName = process.env.COSMOS_DB_DATABASE_NAME ?? 'portfolio';

if (!connectionString) {
  throw new Error('COSMOS_DB_CONNECTION_STRING is not set.');
}

const client = new CosmosClient(connectionString);
const database = client.database(databaseName);

/** Single container (`posts`, partition key /type) holds posts and access logs (type = 'accessLog'). */
export function getContainer(name: 'posts'): Container {
  return database.container(name);
}
