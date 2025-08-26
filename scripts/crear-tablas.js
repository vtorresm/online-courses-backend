const {
  DynamoDBClient,
  CreateTableCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' }); // Cambia a tu región

async function createUsersTable() {
  const params = {
    TableName: 'Users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }, // String
      { AttributeName: 'email', AttributeType: 'S' }, // Para índice global
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  try {
    const command = new CreateTableCommand(params);
    await client.send(command);
    console.log('Tabla Users creada exitosamente.');
  } catch (error) {
    console.error('Error creando tabla:', error);
  }
}

createUsersTable();
