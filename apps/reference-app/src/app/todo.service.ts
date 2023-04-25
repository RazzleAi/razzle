import { v4 as uuidv4 } from 'uuid'
export interface Todo {
  id: string
  title: string
  date: Date
  done: boolean
}

export class TodoService {
  private todos: Todo[] = []

  getAllTodos() {
    return this.todos
  }

  addTodo(title: string): Todo {
    const newTodo = {
      id: uuidv4(),
      title,
      done: false,
      date: new Date(),
    }

    this.todos = [...this.todos, newTodo]
    return newTodo
  }

  getTodosByDate(from: Date, to: Date): Todo[] {
    return this.getAllTodos()
  }

  deleteTodo(id: string): boolean {
    const newTodos = this.todos.filter((td) => td.id !== id)
    const deleted = newTodos.length !== this.todos.length
    this.todos = newTodos
    return deleted
  }

  toggleTodo(id: string, completed: boolean): boolean {
    const toggled = false
    for (const td of this.todos) {
        if (td.id !== id) {
            continue
        }

        td.done = completed
    }
    return toggled
  }
}
