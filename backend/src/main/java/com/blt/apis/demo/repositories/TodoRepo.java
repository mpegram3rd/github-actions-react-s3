package com.blt.apis.demo.repositories;

import com.blt.apis.demo.exceptions.NotFoundException;
import com.blt.apis.demo.models.Todo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class TodoRepo implements ITodoRepo {

    private final RestClient todoClient;

    @Autowired
    public TodoRepo(RestClient todoClient) {
        this.todoClient = todoClient;
    }

    /**
     * Get All the To Dos
     * @return
     */
    @Override
    public List<Todo> GetAll() {
        return todoClient.get()
                .uri("/")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    /**
     * Get a specific To Do
     * @param id
     * @return
     */
    @Override
    public Todo GetById(long id) {
        try {
            return todoClient.get()
                    .uri("/{id}", id)
                    .retrieve()
                    .body(Todo.class);
        }
        catch (HttpClientErrorException.NotFound e) {
            throw new NotFoundException("Could not find todo with id " + id);
        }
    }
}
