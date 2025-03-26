package service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.*;
import java.security.cert.X509Certificate;
import java.util.*;

@Service
public class JiraService {

    @Value("${jira.url}")
    private String jiraUrl;

    @Value("${jira.username}")
    private String jiraUsername;

    @Value("${jira.token}")
    private String jiraApiToken;

    private final RestTemplate restTemplate = createRestTemplate();

    public List<Map<String, Object>> fetchJiraIssues(String issueKeys) {
        List<Map<String, Object>> issues = new ArrayList<>();
        String[] keys = issueKeys.split(",");

        for (String issueKey : keys) {
            String url = jiraUrl + issueKey.trim();
            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(jiraUsername, jiraApiToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                issues.add(response.getBody());
            }
        }
        return issues;
    }

    // Custom RestTemplate to bypass SSL verification
    private static RestTemplate createRestTemplate() {
        try {
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, new TrustManager[]{new X509TrustManager() {
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                public X509Certificate[] getAcceptedIssuers() { return null; }
            }}, new java.security.SecureRandom());

            HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(
                    HttpClients.custom().setSSLContext(sslContext).setSSLHostnameVerifier(NoopHostnameVerifier.INSTANCE).build()
            );
            return new RestTemplate(factory);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create a RestTemplate with SSL disabled", e);
        }
    }
}
