import { useState } from "react";
import TodoService from "../services/todo.service";
import {ITodoData} from "../types/ITodoData.ts";

function Todo() {
    const [todos, setTodos] = useState<ITodoData[]>([]);

    return (
        <div className="todo-container">
            <button onClick={() => {
                TodoService.getTodos()
                    .then(res => setTodos(res));
            }}>Todos</button>
            <div className="todo-results">
                Results:<br/>
                <ul>
                    { todos.map((todo) => (
                        <li key={todo.id}>{todo.title}</li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Todo;
