package com.mapacheBigoton.api.barbero;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/barberos")
public class BarberoController {

    @Autowired
    private BarberoRepository barberoRepository;

    @GetMapping
    public ResponseEntity<Iterable<Barbero>> findAll() {
        return ResponseEntity.ok(barberoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbero> findById(@PathVariable Integer id) {
        Optional<Barbero> barbero = barberoRepository.findById(id);
        return barbero.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Barbero> create(@RequestBody Barbero barbero) {
        return ResponseEntity.ok(barberoRepository.save(barbero));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barbero> update(@PathVariable Integer id, @RequestBody Barbero barbero) {
        if (!barberoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        barbero.setIdBarbero(id);
        return ResponseEntity.ok(barberoRepository.save(barbero));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!barberoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        barberoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
