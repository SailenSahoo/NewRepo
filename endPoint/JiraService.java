package com.example.jira.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class JiraService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${jira.url}")
    private String jiraUrl;

    @Value("${jira.username}")
    private String jiraUsername;

    @Value("${jira.token}")
    private String jiraApiToken;

    public Map<String, Object> getIssueDetails(List<String> issueKeys) {
        List<Map<String, Object>> issues = new ArrayList<>();

        for (String issueKey : issueKeys) {
            String url = jiraUrl + issueKey;

            // Set up authentication headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(jiraUsername, jiraApiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response;

            try {
                response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                issues.add(response.getBody());
            } catch (Exception e) {
                issues.add(Map.of("issueKey", issueKey, "error", "Issue not found or API error"));
            }
        }

        return Map.of("issues", issues);
    }
}
