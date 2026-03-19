package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContactRepository struct {
	db *pgxpool.Pool
}

func NewContactRepository(db *pgxpool.Pool) *ContactRepository {
	return &ContactRepository{db: db}
}

func (r *ContactRepository) Save(ctx context.Context, firstName, lastName, email, phone, message string) (string, error) {
	id := uuid.New().String()

	_, err := r.db.Exec(ctx, `
		INSERT INTO contacts (id, first_name, last_name, email, phone, message, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
	`, id, firstName, lastName, email, nullableString(phone), nullableString(message))
	if err != nil {
		return "", fmt.Errorf("inserting contact: %w", err)
	}

	return id, nil
}

// nullableString converts an empty string to nil for nullable DB columns.
func nullableString(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}
