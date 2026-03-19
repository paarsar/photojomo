package idgen

import "github.com/google/uuid"

func New(prefix string) string {
	return prefix + "-" + uuid.New().String()
}
