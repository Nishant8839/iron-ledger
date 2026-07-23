package com.ironledger.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public void sendPasswordResetEmail(String to, String token) throws Exception {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        String html = """
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #F5F2EB; border-radius: 16px;">
                  <h1 style="font-size: 28px; font-weight: 900; color: #4A4A4A; margin: 0 0 8px;">Iron<span style="color: #C08552;">Ledger</span></h1>
                  <p style="font-size: 13px; color: #B0A89F; margin: 0 0 32px; letter-spacing: 0.05em; text-transform: uppercase;">Password Reset</p>

                  <p style="font-size: 15px; color: #4A4A4A; line-height: 1.6; margin: 0 0 24px;">
                    We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
                  </p>

                  <a href="%s" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #C08552, #DAB49D); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em;">
                    Reset My Password
                  </a>

                  <p style="font-size: 12px; color: #B0A89F; margin: 24px 0 0; line-height: 1.5;">
                    If you didn't request this, you can safely ignore this email.<br/>
                    Link: <a href="%s" style="color: #C08552;">%s</a>
                  </p>
                </div>
                """.formatted(resetUrl, resetUrl, resetUrl);

        String body = """
                {
                  "from": "IronLedger <onboarding@resend.dev>",
                  "to": ["%s"],
                  "subject": "Reset your Iron Ledger password",
                  "html": "%s"
                }
                """.formatted(to, html.replace("\"", "\\\"").replace("\n", "\\n"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200 && response.statusCode() != 201) {
            throw new RuntimeException("Resend API error: " + response.statusCode() + " - " + response.body());
        }
    }
}
