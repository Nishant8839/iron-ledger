package com.ironledger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSessionRequestDTO {
    @NotNull
    private LocalDate date;
    
    private String sessionNotes;
    
    private String sessionNote;
    
    @NotNull
    private List<UpdateSetRequestDTO> sets;
}
