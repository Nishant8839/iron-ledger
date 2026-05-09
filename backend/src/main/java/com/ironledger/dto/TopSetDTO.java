package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class TopSetDTO {
    private LocalDate date;
    private Double weight;
    private String grade;
}
