package com.ipplatform.backend.repository;

import com.ipplatform.backend.model.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    /** All logs, newest-first — used by the main logs endpoint. */
    Page<AdminLog> findAllByOrderByTimestampDesc(Pageable pageable);

    /** Filter by action — used for the optional ?action= query param. */
    Page<AdminLog> findByActionOrderByTimestampDesc(String action, Pageable pageable);
}
