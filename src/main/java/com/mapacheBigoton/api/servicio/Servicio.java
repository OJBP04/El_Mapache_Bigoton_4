package com.mapacheBigoton.api.servicio;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mapacheBigoton.api.cita.Cita;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "servicios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServicio;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false)
    private Double costo;

    // Un servicio puede estar en varias citas
    @OneToMany(mappedBy = "servicio")
    @JsonIgnore
    private List<Cita> citas;
}
