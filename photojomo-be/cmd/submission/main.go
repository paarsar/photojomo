package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/lambda"
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

	contestants := repository.NewContestantRepository(pool)
	submissions := repository.NewSubmissionRepository(pool)
	h := handler.NewSubmissionHandler(pool, contestants, submissions)

	lambda.Start(h.Handle)
}
