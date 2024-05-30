import axios from "axios"
import {ITodoData} from "../types/ITodoData.ts";

const API_URL = "https://jsonplaceholder.typicode.com/todos";

class TodoService {
    async getTodos(): Promise<ITodoData[]> {
        const { data } = await axios.get<ITodoData[]>(API_URL);
        return data;
    }
}

export default new TodoService();