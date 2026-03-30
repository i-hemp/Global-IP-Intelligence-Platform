package com.ipplatform.backend.service;

import com.ipplatform.backend.model.AdminLog;
import com.ipplatform.backend.repository.AdminLogRepository;
import org.springframework.stereotype.Service;

/**
 * Central service for writing audit log entries to admin_logs.
 * All log-producing code in the application calls this single service
 * so log format stays consistent.
 */
@Service
public class AdminLogService {

    private final AdminLogRepository repo;

    public AdminLogService(AdminLogRepository repo) {
        this.repo = repo;
    }

    /**
     * Write a SUCCESS log entry.
     *
     * @param action      Standardised event type (e.g. "USER_REGISTERED")
     * @param performedBy Username from JWT principal, or "system"
     * @param entityType  Kind of object acted on (e.g. "USER", "ANALYST", "PATENT")
     * @param entityId    ID of the object (String — may be Long.toString or Lens ID)
     * @param details     Human-readable description
     */
    public void log(String action, String performedBy,
                    String entityType, String entityId, String details) {
        AdminLog entry = new AdminLog();   // constructor auto-sets timestamp + SUCCESS
        entry.setAction(action);
        entry.setPerformedBy(performedBy);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);
        repo.save(entry);
    }
}
