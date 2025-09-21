package com.mapacheBigoton.api.barbero;
import com.mapacheBigoton.api.cita.Cita;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "barbero")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Barbero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idBarbero;

    @Column(nullable = false, length = 200)
    private String nombre;

    // Relación con Cita
    @OneToMany(mappedBy = "barbero")
    private List<Cita> citas;
}
