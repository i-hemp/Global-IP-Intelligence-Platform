package com.ipplatform.backend.ip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VisualizationService {

    private final LensApiService lensApiService;
    private final ObjectMapper objectMapper;

    public VisualizationService(LensApiService lensApiService, ObjectMapper objectMapper) {
        this.lensApiService = lensApiService;
        this.objectMapper = objectMapper;
    }

    // ------------------ TRENDS ------------------
    public Map<Integer, Long> getTrends(String keyword) {
        try {
            JsonNode response = lensApiService.searchPatents(keyword, null, 0, 50);
            JsonNode patents = response.path("data");

            Map<Integer, Long> trends = new TreeMap<>();

            for (JsonNode patent : patents) {
                String date = patent.path("date_published").asText();

                if (date != null && date.length() >= 4) {
                    int year = Integer.parseInt(date.substring(0, 4));
                    trends.put(year, trends.getOrDefault(year, 0L) + 1);
                }
            }

            return trends;

        } catch (Exception e) {
            throw new RuntimeException("Error processing trends", e);
        }
    }

    // ------------------ CITATIONS ------------------
    public Map<String, List<String>> getCitations(String keyword) {
        try {
            JsonNode response = lensApiService.searchPatents(keyword, null, 0, 50);
            JsonNode patents = response.path("data");

            Map<String, List<String>> result = new HashMap<>();

            for (JsonNode patent : patents) {
                String patentId = patent.path("lens_id").asText();
                List<String> citations = new ArrayList<>();

                JsonNode refs = patent.path("biblio").path("references_cited");

                if (refs.isArray()) {
                    for (JsonNode ref : refs) {
                        citations.add(ref.path("lens_id").asText());
                    }
                }

                result.put(patentId, citations);
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Error processing citations", e);
        }
    }

    // ------------------ FAMILIES ------------------
    public Map<String, List<String>> getFamilies(String keyword) {
        try {
            JsonNode response = lensApiService.searchPatents(keyword, null, 0, 50);
            JsonNode patents = response.path("data");

            Map<String, List<String>> families = new HashMap<>();

            for (JsonNode patent : patents) {
                String familyId = patent.path("doc_key").asText(); // fallback as family_id not always present
                String patentId = patent.path("lens_id").asText();

                families.computeIfAbsent(familyId, k -> new ArrayList<>()).add(patentId);
            }

            return families;

        } catch (Exception e) {
            throw new RuntimeException("Error processing families", e);
        }
    }
}