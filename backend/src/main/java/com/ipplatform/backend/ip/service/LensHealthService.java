package com.ipplatform.backend.ip.service;

import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Pings the Lens.org API with a minimal 1-result patent search.
 * Uses a 3-second timeout so the health check is always fast.
 */
@Service
public class LensHealthService {

    private static final Logger log = LoggerFactory.getLogger(LensHealthService.class);

    @Value("${ip.api.lens.base-url:https://api.lens.org}")
    private String baseUrl;

    @Value("${ip.api.lens.api-key}")
    private String apiKey;

    private final WebClient webClient;

    public LensHealthService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    /**
     * Performs a minimal real patent search (query:"test", size:1, include:[lens_id]).
     * Returns a {@link HealthResult} with status "UP" or "DOWN".
     */
    public HealthResult ping() {
        long startTime = System.currentTimeMillis();

        // Lightest valid Lens.org patent search
        Map<String, Object> body = Map.of(
                "query",   Map.of("query_string", Map.of("query", "test")),
                "size",    1,
                "include", List.of("lens_id")
        );

        try {
            webClient.post()
                    .uri(baseUrl + "/patent/search")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(3))
                    .block();

            long responseTimeMs = System.currentTimeMillis() - startTime;
            log.info("Lens.org health check: UP ({}ms)", responseTimeMs);
            return new HealthResult("UP", responseTimeMs, null);

        } catch (Exception e) {
            // Unwrap reactor's TimeoutException to give a clean message
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            String msg;
            if (cause instanceof TimeoutException || e.getClass().getSimpleName().contains("Timeout")) {
                msg = "Connection timed out after 3 seconds";
            } else {
                // Trim verbose package prefixes — show only the simple class + message
                String raw = cause.getMessage() != null ? cause.getMessage() : cause.getClass().getSimpleName();
                msg = raw.length() > 120 ? raw.substring(0, 120) + "…" : raw;
            }
            log.warn("Lens.org health check: DOWN — {}", msg);
            return new HealthResult("DOWN", null, msg);
        }
    }

    public record HealthResult(String status, Long responseTimeMs, String errorMessage) {}
}
