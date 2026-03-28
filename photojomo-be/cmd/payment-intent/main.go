package main

import (
	"context"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/photojomo/photojomo-be/internal/handler"
	"github.com/photojomo/photojomo-be/internal/secrets"
)

func main() {
	ctx := context.Background()

	stripe, err := secrets.GetStripe(ctx)
	if err != nil {
		panic("failed to fetch Stripe secret: " + err.Error())
	}

	h := handler.NewPaymentIntentHandler(stripe.SecretKey)
	lambda.Start(h.Handle)
}
