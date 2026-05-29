package com.tiendaropa.backend.service;

import com.tiendaropa.backend.entity.Rol;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrarCliente(Usuario usuario) {
        if (usuarioRepository.findByCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuario.setRol(Rol.CLIENTE);

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }
    public Usuario obtenerUsuario(Long id) {

        return usuarioRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado"));

    }

    public Usuario actualizarUsuario(
            Long id,
            Usuario usuario
    ) {

        Usuario usuarioDB = usuarioRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado"));

        usuarioDB.setNombre(
                usuario.getNombre()
        );

        usuarioDB.setCorreo(
                usuario.getCorreo()
        );

        return usuarioRepository.save(
                usuarioDB
        );

    }

    public void eliminarUsuario(Long id) {

        usuarioRepository.deleteById(id);

    }
}