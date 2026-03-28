package main

import (
	"context"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/photojomo/photojomo-be/internal/handler"
	"github.com/photojomo/photojomo-be/internal/secrets"
)

func main() {
	ctx := context.Background()

	paypal, err := secrets.GetPaypal(ctx)
	if err != nil {
		panic("failed to fetch PayPal secret: " + err.Error())
	}

	h := handler.NewPaypalOrderHandler(paypal.ClientID, paypal.ClientSecret)
	lambda.Start(h.HandleCreate)
}
