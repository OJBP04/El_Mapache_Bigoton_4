package com.mapacheBigoton.api.barbero;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarberoRepository extends CrudRepository<Barbero, Integer> {
}