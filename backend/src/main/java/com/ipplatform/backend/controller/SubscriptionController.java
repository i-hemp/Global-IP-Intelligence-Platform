package com.ipplatform.backend.controller;

import com.ipplatform.backend.model.User;
import com.ipplatform.backend.model.UserSubscription;
import com.ipplatform.backend.repository.UserRepository;
import com.ipplatform.backend.repository.UserSubscriptionRepository;
import com.ipplatform.backend.service.AdminLogService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Subscription endpoints — ROLE_USER only.
 *
 * POST   /api/subscriptions/{lensId}        → subscribe to a patent
 * DELETE /api/subscriptions/{lensId}        → unsubscribe from a patent
 * GET    /api/subscriptions                 → list all subscribed patents
 * GET    /api/subscriptions/{lensId}/status → check if subscribed
 */
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final UserSubscriptionRepository subscriptionRepo;
    private final UserRepository userRepo;
    private final AdminLogService logService;

    public SubscriptionController(UserSubscriptionRepository subscriptionRepo,
                                   UserRepository userRepo,
                                   AdminLogService logService) {
        this.subscriptionRepo = subscriptionRepo;
        this.userRepo         = userRepo;
        this.logService       = logService;
    }

    // ── Helper: resolve userId from JWT principal ─────────────────────────────
    private Long getUserId(Principal principal) {
        User user = userRepo.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // ── Subscribe ─────────────────────────────────────────────────────────────

    /**
     * POST /api/subscriptions/{lensId}
     * Body: { "title": "...", "jurisdiction": "US", "datePub": "2023-01-01" }
     */
    @PostMapping("/{lensId}")
    public ResponseEntity<Map<String, Object>> subscribe(
            @PathVariable String lensId,
            @RequestBody Map<String, String> body,
            Principal principal) {

        Long userId = getUserId(principal);

        if (subscriptionRepo.existsByUserIdAndLensId(userId, lensId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Already subscribed to this patent."));
        }

        UserSubscription sub = new UserSubscription(
                userId,
                lensId,
                body.getOrDefault("title", ""),
                body.getOrDefault("jurisdiction", ""),
                body.getOrDefault("datePub", "")
        );
        subscriptionRepo.save(sub);

        String title = body.getOrDefault("title", "");
        logService.log("SUBSCRIPTION_CREATED", principal.getName(), "PATENT", lensId,
                "Subscribed to: " + title);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Subscribed successfully."));
    }

    // ── Unsubscribe ───────────────────────────────────────────────────────────

    /**
     * DELETE /api/subscriptions/{lensId}
     */
    @Transactional
    @DeleteMapping("/{lensId}")
    public ResponseEntity<Map<String, String>> unsubscribe(
            @PathVariable String lensId,
            Principal principal) {

        Long userId = getUserId(principal);

        if (!subscriptionRepo.existsByUserIdAndLensId(userId, lensId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Subscription not found."));
        }

        subscriptionRepo.deleteByUserIdAndLensId(userId, lensId);

        logService.log("SUBSCRIPTION_DELETED", principal.getName(), "PATENT", lensId,
                "Unsubscribed from patent");

        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully."));
    }

    // ── List all subscriptions ────────────────────────────────────────────────

    /**
     * GET /api/subscriptions
     */
    @GetMapping
    public ResponseEntity<List<UserSubscription>> list(Principal principal) {
        Long userId = getUserId(principal);
        return ResponseEntity.ok(subscriptionRepo.findByUserId(userId));
    }

    // ── Check status ──────────────────────────────────────────────────────────

    /**
     * GET /api/subscriptions/{lensId}/status
     * Returns: { "subscribed": true/false }
     */
    @GetMapping("/{lensId}/status")
    public ResponseEntity<Map<String, Boolean>> status(
            @PathVariable String lensId,
            Principal principal) {

        Long userId = getUserId(principal);
        boolean subscribed = subscriptionRepo.existsByUserIdAndLensId(userId, lensId);
        return ResponseEntity.ok(Map.of("subscribed", subscribed));
    }
}
