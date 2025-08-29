import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersRepository {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    this.client = new DynamoDBClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.tableName = this.configService.get('DYNAMODB_TABLE_USERS');
  }

  async createUser(user: { email: string; password: string; role: string }) {
    const userId = uuidv4();
    const params = {
      TableName: this.tableName,
      Item: marshall({
        userId,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: new Date().toISOString(),
      }),
    };
    await this.client.send(new PutItemCommand(params));
    return { userId, email: user.email, role: user.role };
  }

  async findUserByEmail(email: string) {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: marshall({ ':email': email }),
    };
    const { Items } = await this.client.send(new QueryCommand(params));
    if (Items?.length) {
      return unmarshall(Items[0]);
    }
    return null;
  }

  async findUserById(userId: string) {
    const params = {
      TableName: this.tableName,
      Key: marshall({ userId }),
    };
    const { Item } = await this.client.send(new GetItemCommand(params));
    return Item ? unmarshall(Item) : null;
  }
}
