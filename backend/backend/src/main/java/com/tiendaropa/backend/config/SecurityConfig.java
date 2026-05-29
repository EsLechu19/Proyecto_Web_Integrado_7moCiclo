package com.tiendaropa.backend.config;

import com.tiendaropa.backend.security.JwtAuthFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;

import org.springframework.web.cors.CorsConfigurationSource;

import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration

public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter
    ) {

        this.jwtAuthFilter = jwtAuthFilter;

    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors -> {})

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                )

                .formLogin(form ->
                        form.disable()
                )

                .sessionManagement(session ->

                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )

                )

                .authorizeHttpRequests(auth -> auth

                        // AUTH

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // USUARIOS (registro publico, el resto autenticado)

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/usuarios/registro"
                        ).permitAll()

                        .requestMatchers(
                                "/api/usuarios/**"
                        ).authenticated()

                        // PRODUCTOS PUBLICOS

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/productos/**"
                        ).permitAll()

                        // CATEGORIAS PUBLICAS

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categorias/**"
                        ).permitAll()

                        // ADMIN PRODUCTOS

                        .requestMatchers(
                                "/api/productos/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // ADMIN CATEGORIAS

                        .requestMatchers(
                                "/api/categorias/**"
                        ).hasAuthority("ROLE_ADMIN")

                        // PEDIDOS

                        .requestMatchers(
                                "/api/pedidos/**"
                        ).hasAnyAuthority(
                                "ROLE_ADMIN",
                                "ROLE_CLIENTE"
                        )

                        // CARRITO

                        .requestMatchers(
                                "/api/carrito/**"
                        ).hasAuthority(
                                "ROLE_CLIENTE"
                        )

                        // TODO LO DEMAS

                        .anyRequest()
                        .authenticated()

                )

                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(

                List.of(
                        "http://localhost:4200"
                )

        );

        configuration.setAllowedMethods(

                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )

        );

        configuration.setAllowedHeaders(

                List.of("*")

        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;

    }

}