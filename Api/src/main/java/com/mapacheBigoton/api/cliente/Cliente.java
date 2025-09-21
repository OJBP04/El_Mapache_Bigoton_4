package com.mapacheBigoton.api.cliente;


import com.mapacheBigoton.api.cita.Cita;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "cliente")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCliente;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(nullable = false, length = 45)
    private String telefono;

    // Relación con Cita
    @OneToMany(mappedBy = "cliente")
    private List<Cita> citas;
}

