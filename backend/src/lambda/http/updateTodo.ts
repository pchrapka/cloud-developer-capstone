import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todos'
const logger = createLogger('updateTodo')

export const handler = middy( async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Event', event)
  const todoId = event.pathParameters.todoId
  const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  try{
    await updateTodo(userId, todoId, updateTodoRequest)
    return {
      statusCode: 200,
      body: ''
    }
  } catch(e) {
    logger.error('Error updating todo', { error: e.message })
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
