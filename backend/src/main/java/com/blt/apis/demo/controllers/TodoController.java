package com.blt.apis.demo.controllers;

import com.blt.apis.demo.models.Todo;
import com.blt.apis.demo.services.ITodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * To Dos Rest API
 */
@RestController
@RequestMapping("/api/v1/todos")
public class TodoController {

    private final ITodoService todoService;

    /**
     * Construction
     * @param todoService
     */
    @Autowired
    public TodoController(ITodoService todoService) {
        this.todoService = todoService;
    }

    /**
     * Retrieve all the todos
     * @return
     */
    @GetMapping
    public ResponseEntity<List<Todo>> getTodos() {
        return ResponseEntity.ok(todoService.GetAll());
    }

    /**
     * Retrieve a specific To Do
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable("id") long id) {
        return ResponseEntity.ok(todoService.GetById(id));
    }

}
