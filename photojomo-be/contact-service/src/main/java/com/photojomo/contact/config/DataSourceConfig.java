package com.photojomo.contact.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class DataSourceConfig {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Bean
    public DataSource dataSource() {
        String secretArn = System.getenv("DB_SECRET_ARN");

        log.info("Fetching DB credentials from Secrets Manager");

        try (SecretsManagerClient client = SecretsManagerClient.builder()
                .region(Region.of(System.getenv().getOrDefault("AWS_REGION", "us-east-1")))
                .build()) {

            String secretJson = client.getSecretValue(
                    GetSecretValueRequest.builder().secretId(secretArn).build()
            ).secretString();

            JsonNode secret = MAPPER.readTree(secretJson);

            String host     = secret.get("host").asText();
            String port     = secret.get("port").asText();
            String dbname   = secret.get("dbname").asText();
            String username = secret.get("username").asText();
            String password = secret.get("password").asText();

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(String.format("jdbc:postgresql://%s:%s/%s", host, port, dbname));
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("org.postgresql.Driver");
            config.setMinimumIdle(1);
            config.setMaximumPoolSize(2);
            config.setConnectionTimeout(10_000);
            config.setIdleTimeout(30_000);

            log.info("DataSource configured for host: {}", host);
            return new HikariDataSource(config);

        } catch (Exception e) {
            throw new IllegalStateException("Failed to configure DataSource from Secrets Manager", e);
        }
    }
}
