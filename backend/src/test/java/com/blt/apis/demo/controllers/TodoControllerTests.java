package com.blt.apis.demo.controllers;

import com.blt.apis.demo.models.Todo;
import com.blt.apis.demo.services.ITodoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;


@ExtendWith(MockitoExtension.class)
public class TodoControllerTests {

    @Mock
    private ITodoService todoService;

    @InjectMocks
    private TodoController controller;

    /**
     * Tests the getTodos() happy path test case
     */
    @Test
    public void getTodosHappyPath() {
        Todo[] todos = new Todo[] {
                new Todo(1, "title", "user-id", false),
                new Todo(2, "title2", "user-id2", true)
        };
        when(todoService.GetAll()).thenReturn(Arrays.asList(todos));

        ResponseEntity<List<Todo>> result = controller.getTodos();

        assertThat(result.getStatusCode().value(), is(200));
        assertThat(result.getBody(), hasSize(2));

        verify(todoService).GetAll();
    }

    /**
     * Tests the getTodoById() happy path test case
     */
    @Test
    public void getTodoByIdHappyPath() {
        long testId = 1;
        Todo expected = new Todo(1, "title", "user-id", false);

        when(todoService.GetById(testId)).thenReturn(expected);

        ResponseEntity<Todo> result = controller.getTodoById(testId);

        assertThat(result.getStatusCode().value(), is(200));
        assertThat(result.getBody(), is(expected));

        verify(todoService).GetById(testId);
    }
}
