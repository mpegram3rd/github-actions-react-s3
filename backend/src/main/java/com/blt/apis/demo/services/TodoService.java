package com.blt.apis.demo.services;

import com.blt.apis.demo.models.Todo;
import com.blt.apis.demo.repositories.ITodoRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Business logic for retrieving To Do items
 */
@Service
public class TodoService implements ITodoService {

    private final ITodoRepo repo;

    @Autowired
    public TodoService(ITodoRepo repo) {
        this.repo = repo;
    }

    /**
     * Retrieve a specific To Do item
     * @param id
     * @return
     */
    @Override
    public Todo GetById(long id) {
        return repo.GetById(id);
    }

    /**
     * Retrieve all the To Do Items
     * @return
     */
    @Override
    public List<Todo> GetAll() {
        return repo.GetAll();
    }
}
