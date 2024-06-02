package com.blt.apis.demo.repositories;

import com.blt.apis.demo.models.Todo;

import java.util.List;

/**
 * Interface for working with the To Do Datasource
 */
public interface ITodoRepo {
    /**
     * Get All the To Dos
     * @return
     */
    List<Todo> GetAll();

    /**
     * Get a specific To Do
     * @param id
     * @return
     */
    Todo GetById(long id);
}
