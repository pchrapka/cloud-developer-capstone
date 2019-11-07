import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { getTodos } from '../../businessLogic/todos'
const logger = createLogger('getTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  logger.info('Caller event', event)
  const userId = getUserId(event)

  try{
    const todos = await getTodos(userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        items: todos
      })
    }
  } catch(e) {
    logger.error('Error getting todo', { error: e.message})
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
