package com.tiendaropa.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilidad para generar hashes BCrypt (usar solo en desarrollo).
 */
public class GeneradorHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args.length > 0 ? args[0] : "admin123";
        String hash = encoder.encode(password);
        System.out.println("Hash para '" + password + "': " + hash);
    }
}
