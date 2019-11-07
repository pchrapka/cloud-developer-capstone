import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'
const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  // TODO: Remove a TODO item by id
  logger.info({userId: userId, todoId: todoId})
  try{
    await deleteTodo(userId, todoId)
    return {
      statusCode: 200,
      body: ''
    }
  } catch(e) {
    logger.error('Error deleting todo', { error: e.message})
    return {
      statusCode: 400,
      body: ''
    }
  }
})

handler.use(
  cors({
    credentials: true
  })
)
