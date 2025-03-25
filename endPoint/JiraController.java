package com.example.jira.controller;

import com.example.jira.service.JiraService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jira")
public class JiraController {

    private final JiraService jiraService;

    public JiraController(JiraService jiraService) {
        this.jiraService = jiraService;
    }

    @GetMapping("/search")
    public Map<String, Object> searchIssues(@RequestParam List<String> issueKeys) {
        return jiraService.getIssueDetails(issueKeys);
    }
}
