package com.blt.apis.demo.services;

import com.blt.apis.demo.models.Todo;

import java.util.List;

/**
 * Service for To Do retrieval
 */
public interface ITodoService {

    /**
     * Retrieve a specific To Do item
     * @param id
     * @return
     */
    Todo GetById(long id);

    /**
     * Retrieve all the To Do items
     * @return
     */
    List<Todo> GetAll();
}
