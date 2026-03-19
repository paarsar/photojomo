package repository

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/photojomo/photojomo-be/internal/idgen"
)

type SubmissionRepository struct {
	db *pgxpool.Pool
}

func NewSubmissionRepository(db *pgxpool.Pool) *SubmissionRepository {
	return &SubmissionRepository{db: db}
}

type Submission struct {
	ContestantID  string
	Category      string
	Tier          string
	AmountPaid    float64
	PaymentMethod string
}

func (r *SubmissionRepository) Save(ctx context.Context, tx pgx.Tx, s Submission) (string, error) {
	id := idgen.New("sub")

	_, err := tx.Exec(ctx, `
		INSERT INTO submission (
			id, contestant_id, category, tier,
			amount_paid, payment_method, payment_status,
			created_at
		) VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
	`, id, s.ContestantID, s.Category, s.Tier, s.AmountPaid, s.PaymentMethod,
	)
	if err != nil {
		return "", fmt.Errorf("inserting submission: %w", err)
	}

	return id, nil
}
