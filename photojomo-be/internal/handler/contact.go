package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/photojomo/photojomo-be/internal/repository"
)

type ContactRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Phone     string `json:"phone,omitempty"`
	Message   string `json:"message,omitempty"`
}

type ContactResponse struct {
	ID      string `json:"id"`
	Message string `json:"message"`
	Success bool   `json:"success"`
}

type ContactHandler struct {
	repo *repository.ContactRepository
}

func NewContactHandler(repo *repository.ContactRepository) *ContactHandler {
	return &ContactHandler{repo: repo}
}

func (h *ContactHandler) Handle(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body ContactRequest
	if err := json.Unmarshal([]byte(req.Body), &body); err != nil {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "Invalid request body",
			"success": false,
		}), nil
	}

	if body.FirstName == "" || body.LastName == "" || body.Email == "" {
		return jsonResponse(http.StatusBadRequest, map[string]interface{}{
			"message": "firstName, lastName, and email are required",
			"success": false,
		}), nil
	}

	id, err := h.repo.Save(ctx, body.FirstName, body.LastName, body.Email, body.Phone, body.Message)
	if err != nil {
		log.Printf("error saving contact: %v", err)
		return jsonResponse(http.StatusInternalServerError, map[string]interface{}{
			"message": "Failed to save contact",
			"success": false,
		}), nil
	}

	return jsonResponse(http.StatusCreated, ContactResponse{
		ID:      id,
		Message: "Contact information saved successfully.",
		Success: true,
	}), nil
}

func jsonResponse(statusCode int, body interface{}) events.APIGatewayV2HTTPResponse {
	b, _ := json.Marshal(body)
	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       string(b),
	}
}
