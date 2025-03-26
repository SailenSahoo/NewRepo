package controller;

import com.cate.stash.jira_rest_endpoint.service.JiraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jira")
@CrossOrigin(origins = "*") // Enable CORS globally
public class JiraController {

    @Autowired
    private JiraService jiraService;

    @GetMapping("/search")
    public List<Map<String, Object>> getJiraIssues(@RequestParam String issueKeys) {
        return jiraService.fetchJiraIssues(issueKeys);
    }
}
