import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { TodoItem } from '../models/TodoItem'

import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
const logger = createLogger('todosAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly s3 = createS3Client(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.TODOS_INDEX,
        private readonly bucketName = process.env.TODOS_ATTACHMENT_S3_BUCKET
    ) { }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {

        logger.info('Creating new todo', todoItem)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem as TodoItem
    }

    async deleteTodo(userId: string, todoId: string) {
      const todoItem = await this.getTodo(userId, todoId)

      if('attachmentUrl' in todoItem){
        logger.info('Deleting attachment')
        await this.s3.deleteObject({
          Bucket: this.bucketName, 
          Key: todoId
        }).promise()
      }
    
      logger.info('Deleting todo')
      await this.docClient.delete({
        TableName: this.todosTable,
        Key:{
          "userId": todoItem.userId,
          "createdAt": todoItem.createdAt
        }
      }).promise()
    }

    async getTodos(userId: string){
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise()
    
        return result.Items
    }

    // TODO Add getTodo
    async getTodo(userId: string, todoId: string): Promise<TodoItem>{
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId and todoId = :todoId',
            ExpressionAttributeValues:{
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
    
        if (result.Count === 0){
            logger.error('Todo not found')
            throw new Error('Todo not found')
        }
    
        return result.Items[0] as TodoItem
    }

    async updateTodo(userId: string, todoId: string, updatedTodoRequest: UpdateTodoRequest){    
        const todoItem = await this.getTodo(userId, todoId)
    
        logger.info('Updating todo')
    
        await this.docClient.update({
            TableName: this.todosTable,
            Key:{
                "userId": todoItem.userId,
                "createdAt": todoItem.createdAt
            },
            UpdateExpression: "set done=:done, dueDate=:dueDate, #name=:name",
            ExpressionAttributeValues:{
                ":done":updatedTodoRequest.done,
                ":dueDate":updatedTodoRequest.dueDate,
                ":name":updatedTodoRequest.name,
            },
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ReturnValues:"UPDATED_NEW"
        }).promise()
    }
}

function createDynamoDBClient() {
    return new AWS.DynamoDB.DocumentClient()
}

function createS3Client() {
    return new AWS.S3({
        signatureVersion: 'v4'
    })
}