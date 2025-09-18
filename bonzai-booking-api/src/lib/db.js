const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Create a low-level DynamoDB client
const client = new DynamoDBClient({});

// Wrap it in DocumentClient for easier JSON handling
const docClient = DynamoDBDocumentClient.from(client);

module.exports = { docClient };
