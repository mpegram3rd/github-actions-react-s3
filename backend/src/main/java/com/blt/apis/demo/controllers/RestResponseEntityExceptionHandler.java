package com.blt.apis.demo.controllers;

import com.blt.apis.demo.exceptions.NotFoundException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Provides handlers for various exceptions that we want to handle in a sensible way
 */
@ControllerAdvice
public class RestResponseEntityExceptionHandler  extends ResponseEntityExceptionHandler {


    public RestResponseEntityExceptionHandler() { super(); }

    /**
     * Provide a descriptive error message on NotFound
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(NotFoundException.class)
    protected ResponseEntity<Object> handleNotFoundException(NotFoundException ex, WebRequest request) {
        String result = String.format("{ \"errorMessage\": \"%s\" }", ex.getMessage());
        return handleExceptionInternal(ex, result, new HttpHeaders(), HttpStatus.NOT_FOUND, request);
    }

}
