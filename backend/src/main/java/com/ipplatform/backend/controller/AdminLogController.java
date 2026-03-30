package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.AdminLog;
import com.ipplatform.backend.repository.AdminLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GET /api/admin/logs?page=0&size=20&action=ANALYST_APPROVED
 *
 * Returns paginated audit log entries, newest-first.
 * Optional ?action= filter narrows to a specific event type.
 */
@RestController
@RequestMapping("/api/admin/logs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminLogController {

    private final AdminLogRepository logRepo;

    public AdminLogController(AdminLogRepository logRepo) {
        this.logRepo = logRepo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam(defaultValue = "0")   int    page,
            @RequestParam(defaultValue = "20")  int    size,
            @RequestParam(required = false)     String action) {

        // Cap size at 100 to avoid accidental large pulls
        int cappedSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, cappedSize);

        Page<AdminLog> results = (action != null && !action.isBlank())
                ? logRepo.findByActionOrderByTimestampDesc(action, pageable)
                : logRepo.findAllByOrderByTimestampDesc(pageable);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("content",       results.getContent());
        body.put("totalElements", results.getTotalElements());
        body.put("totalPages",    results.getTotalPages());
        body.put("page",          results.getNumber());
        body.put("size",          results.getSize());

        return ResponseEntity.ok(body);
    }
}
