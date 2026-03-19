package db

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
	"github.com/jackc/pgx/v5/pgxpool"
)

type secret struct {
	Host     string `json:"host"`
	Port     string `json:"port"`
	DBName   string `json:"dbname"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// Connect fetches database credentials from Secrets Manager and returns a connection pool.
func Connect(ctx context.Context) (*pgxpool.Pool, error) {
	secretArn := os.Getenv("DB_SECRET_ARN")
	if secretArn == "" {
		return nil, fmt.Errorf("DB_SECRET_ARN environment variable not set")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("loading AWS config: %w", err)
	}

	sm := secretsmanager.NewFromConfig(cfg)
	result, err := sm.GetSecretValue(ctx, &secretsmanager.GetSecretValueInput{
		SecretId: aws.String(secretArn),
	})
	if err != nil {
		return nil, fmt.Errorf("fetching secret: %w", err)
	}

	var s secret
	if err := json.Unmarshal([]byte(*result.SecretString), &s); err != nil {
		return nil, fmt.Errorf("parsing secret: %w", err)
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=require pool_max_conns=2",
		s.Host, s.Port, s.DBName, s.Username, s.Password,
	)

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, fmt.Errorf("connecting to database: %w", err)
	}

	return pool, nil
}
