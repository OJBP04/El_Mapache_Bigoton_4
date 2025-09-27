package com.mapacheBigoton.api.cita;


import com.mapacheBigoton.api.barbero.Barbero;
import com.mapacheBigoton.api.cliente.Cliente;
import com.mapacheBigoton.api.servicio.Servicio;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Entity
@Table(name = "citas")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCita;

    @Column(nullable = false, length = 45)
    private String fecha;

    @Column(nullable = false, length = 45)
    private String hora;

    // Relación con Barbero
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "idBarbero", nullable = false)
    private Barbero barbero;

    // Relación con Cliente
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "idCliente", nullable = false)
    private Cliente cliente;

    // Relación con Servicio (muchas citas pueden tener el mismo servicio)
    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "idServicio", nullable = false)
    private Servicio servicio;
}
