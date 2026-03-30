package com.ipplatform.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Audit log entry for significant system events.
 * Maps to the admin_logs table.
 */
@Entity
@Table(name = "admin_logs")
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "performed_by", length = 255)
    private String performedBy;

    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id", length = 255)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false, length = 20)
    private String status;

    /** No-arg constructor required by JPA. Sets safe defaults. */
    public AdminLog() {
        this.timestamp = Instant.now();
        this.status    = "SUCCESS";
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId()                      { return id; }
    public void setId(Long id)               { this.id = id; }

    public Instant getTimestamp()            { return timestamp; }
    public void setTimestamp(Instant t)      { this.timestamp = t; }

    public String getAction()                { return action; }
    public void setAction(String action)     { this.action = action; }

    public String getPerformedBy()           { return performedBy; }
    public void setPerformedBy(String by)    { this.performedBy = by; }

    public String getEntityType()            { return entityType; }
    public void setEntityType(String et)     { this.entityType = et; }

    public String getEntityId()              { return entityId; }
    public void setEntityId(String id)       { this.entityId = id; }

    public String getDetails()               { return details; }
    public void setDetails(String details)   { this.details = details; }

    public String getStatus()                { return status; }
    public void setStatus(String status)     { this.status = status; }
}
