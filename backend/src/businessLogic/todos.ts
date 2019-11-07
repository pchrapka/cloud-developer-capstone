import * as uuid from 'uuid'
import { TodoItem } from "../models/TodoItem"
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

import { createLogger } from '../utils/logger'
import { TodoAccess } from '../dataLayer/todosAccess'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
const logger = createLogger('todos')

const todosAccess = new TodoAccess()

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    logger.info('Creating todo', {userId: userId, todoId: todoId})

    return await todosAccess.createTodo({
        todoId: todoId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false
    })
}

export async function deleteTodo(userId: string, todoId: string){
    logger.info('Deleting todo', {userId: userId, todoId: todoId})
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function getTodos(userId: string){
    logger.info('Getting todos', {userId: userId})
    return await todosAccess.getTodos(userId)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updatedTodoRequest: UpdateTodoRequest
  ) {
    logger.info('Updating todo', {userId: userId, todoId: todoId})
    return await todosAccess.updateTodo(userId, todoId, updatedTodoRequest)
  }