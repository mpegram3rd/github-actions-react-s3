package com.blt.apis.demo.controllers;

import com.blt.apis.demo.models.RuntimeStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class RootController {

    @GetMapping
    public ResponseEntity<RuntimeStatus> root() {
        return ResponseEntity.ok(new RuntimeStatus("System is UP"));
    }
}
