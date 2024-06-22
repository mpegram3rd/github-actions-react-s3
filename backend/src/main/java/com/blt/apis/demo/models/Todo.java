package com.blt.apis.demo.models;

/**
 * Model the represents a To Do item
 */
public record Todo(long id, String title, String userId, boolean completed) {

}
