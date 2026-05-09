package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDTO {
    private Double highestTopSet;
    private Long totalSessions;
    private Integer currentStreak;
}
