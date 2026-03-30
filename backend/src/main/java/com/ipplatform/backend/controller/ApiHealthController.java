package com.ipplatform.backend.controller;

import com.ipplatform.backend.ip.service.LensHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GET /api/admin/health
 * Returns real-time Lens.org API reachability for the admin dashboard.
 * Checked live on each request — no DB storage.
 */
@RestController
@RequestMapping("/api/admin/health")
@PreAuthorize("hasRole('ADMIN')")
public class ApiHealthController {

    private final LensHealthService lensHealthService;

    public ApiHealthController(LensHealthService lensHealthService) {
        this.lensHealthService = lensHealthService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        LensHealthService.HealthResult result = lensHealthService.ping();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("api",            "lens");
        body.put("status",         result.status());
        body.put("responseTimeMs", result.responseTimeMs());
        body.put("checkedAt",      Instant.now().toString());
        body.put("errorMessage",   result.errorMessage());

        return ResponseEntity.ok(body);
    }
}
