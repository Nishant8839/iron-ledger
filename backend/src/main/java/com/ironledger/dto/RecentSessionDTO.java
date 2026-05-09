package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class RecentSessionDTO {
    private Long id;
    private LocalDate date;
    private String exercises;
    private String topGrade;
}
