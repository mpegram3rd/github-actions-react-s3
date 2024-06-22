package com.blt.apis.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Application specific configuration and bean definitions
 */
@Configuration
public class AppConfig {

    /**
     * Todo REST Client configuration
     * @return
     */
    @Bean
    public RestClient todoClient() {
        return RestClient.builder()
                .baseUrl("https://jsonplaceholder.typicode.com/todos")
                .build();
    }
}
