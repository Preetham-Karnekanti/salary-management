package com.acme.salarymanagement.dto.common;

import java.time.LocalDateTime;

public record ErrorResponse(
        int status,
        String message,
        LocalDateTime timestamp
) {
}