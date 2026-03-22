package main

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/photojomo/photojomo-be/internal/db"
	"github.com/photojomo/photojomo-be/internal/handler"
	"github.com/photojomo/photojomo-be/internal/repository"
)

func main() {
	ctx := context.Background()

	pool, err := db.Connect(ctx)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		log.Fatalf("failed to load AWS config: %v", err)
	}

	imagesBucket := os.Getenv("IMAGES_BUCKET")
	if imagesBucket == "" {
		log.Fatal("IMAGES_BUCKET environment variable is required")
	}

	s3Client := s3.NewFromConfig(cfg)
	entries := repository.NewContestEntryRepository()
	h := handler.NewContestEntryHandler(pool, entries, s3Client, imagesBucket)

	lambda.Start(h.Handle)
}
