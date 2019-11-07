import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es'

import { createLogger } from '../../utils/logger'
const logger = createLogger('elasticSearchSync')

const esHost = process.env.ES_ENDPOINT

const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  logger.info('Processing events batch from DynamoDB', event)

  for (const record of event.Records) {
    logger.info('Processing record', record)
    if (record.eventName !== 'INSERT') {
      continue
    }

    const newItem = record.dynamodb.NewImage

    const todoId = newItem.todoId.S

    const body = {
        userId: newItem.userId.S,
        todoId: newItem.todoId.S,
        createdAt: newItem.createdAt.S,
        name: newItem.name.S,
        dueDate: newItem.dueDate.S,
        done: newItem.done.BOOL,
        attachmentUrl: undefined
    }

    if('attachmentUrl' in newItem){
        body.attachmentUrl = newItem.attachmentUrl.S
    }

    await es.index({
      index: 'todos-index',
      type: 'todos',
      id: todoId,
      body
    })

  }
}
