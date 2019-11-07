import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'
import { createTodo } from '../../businessLogic/todos'
const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  // TODO: Implement creating a new TODO item
  try{
    const newItem = await createTodo(newTodo, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  } catch(e) {
    logger.error('Error creating todo', {error: e.message})
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
