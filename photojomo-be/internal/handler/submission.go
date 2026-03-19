package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/photojomo/photojomo-be/internal/repository"
)

var validCategories = map[string]bool{
	"general":           true,
	"emerging_creator":  true,
	"college_creator":   true,
	"master_your_craft": true,
}

var validTiers = map[string]float64{
	"explorer":   25.00,
	"enthusiast": 45.00,
	"visionary":  65.00,
	"master":     95.00,
}

type SubmissionRequest struct {
	FirstName           string  `json:"firstName"`
	LastName            string  `json:"lastName"`
	Email               string  `json:"email"`
	Country             string  `json:"country"`
	ConfirmImagesDates  bool    `json:"confirmImagesDates"`
	ConfirmAge          bool    `json:"confirmAge"`
	ConfirmRules        bool    `json:"confirmRules"`
	MarketingConsent    bool    `json:"marketingConsent"`
	Category            string  `json:"category"`
	Tier                string  `json:"tier"`
	AmountPaid          float64 `json:"amountPaid"`
	PaymentMethod       string  `json:"paymentMethod"`
}

type SubmissionResponse struct {
	ContestantID string `json:"contestantId"`
	SubmissionID string `json:"submissionId"`
	Message      string `json:"message"`
	Success      bool   `json:"success"`
}

type SubmissionHandler struct {
	db          *pgxpool.Pool
	contestants *repository.ContestantRepository
	submissions *repository.SubmissionRepository
}

func NewSubmissionHandler(db *pgxpool.Pool, contestants *repository.ContestantRepository, submissions *repository.SubmissionRepository) *SubmissionHandler {
	return &SubmissionHandler{db: db, contestants: contestants, submissions: submissions}
}

func (h *SubmissionHandler) Handle(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body SubmissionRequest
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "Invalid request body",
			"success": false,
		}), nil
	}

	if body.FirstName == "" || body.LastName == "" || body.Email == "" || body.Country == "" {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "firstName, lastName, email, and country are required",
			"success": false,
		}), nil
	}

	if !validCategories[body.Category] {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "invalid category",
			"success": false,
		}), nil
	}

	if _, ok := validTiers[body.Tier]; !ok {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "invalid tier",
			"success": false,
		}), nil
	}

	if body.PaymentMethod != "stripe" && body.PaymentMethod != "paypal" {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "paymentMethod must be stripe or paypal",
			"success": false,
		}), nil
	}

	// Begin transaction
	tx, err := h.db.Begin(ctx)
	if err != nil {
		log.Printf("error beginning transaction: %v", err)
		return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
			"message": "Internal server error",
			"success": false,
		}), nil
	}
	defer tx.Rollback(ctx)

	// Find or create contestant
	existing, err := h.contestants.FindByEmail(ctx, body.Email)
	if err != nil {
		log.Printf("error looking up contestant: %v", err)
		return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
			"message": "Internal server error",
			"success": false,
		}), nil
	}

	var contestantID string
	if existing != nil {
		contestantID = existing.ID
	} else {
		contestantID, err = h.contestants.Save(ctx, tx, repository.Contestant{
			FirstName:          body.FirstName,
			LastName:           body.LastName,
			Email:              body.Email,
			Country:            body.Country,
			ConfirmImagesDates: body.ConfirmImagesDates,
			ConfirmAge:         body.ConfirmAge,
			ConfirmRules:       body.ConfirmRules,
			MarketingConsent:   body.MarketingConsent,
		})
		if err != nil {
			log.Printf("error creating contestant: %v", err)
			return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
				"message": "Internal server error",
				"success": false,
			}), nil
		}
	}

	// Create submission
	submissionID, err := h.submissions.Save(ctx, tx, repository.Submission{
		ContestantID:  contestantID,
		Category:      body.Category,
		Tier:          body.Tier,
		AmountPaid:    body.AmountPaid,
		PaymentMethod: body.PaymentMethod,
	})
	if err != nil {
		log.Printf("error creating submission: %v", err)
		return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
			"message": "Internal server error",
			"success": false,
		}), nil
	}

	if err := tx.Commit(ctx); err != nil {
		log.Printf("error committing transaction: %v", err)
		return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
			"message": "Internal server error",
			"success": false,
		}), nil
	}

	return jsonResponse(http.StatusCreated, SubmissionResponse{
		ContestantID: contestantID,
		SubmissionID: submissionID,
		Message:      "Submission created successfully.",
		Success:      true,
	}), nil
}
