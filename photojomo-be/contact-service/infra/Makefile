ENV         ?= dev
PROJECT     ?= photojomo
REGION      ?= us-east-1

FUNCTION_NAME := $(PROJECT)-$(ENV)-contact-service
S3_BUCKET     := $(PROJECT)-$(ENV)-lambda-artifacts
S3_KEY        := contact-service/contact-service.jar
JAR_PATH      := ../target/contact-service.jar

.PHONY: build upload update deploy

build:
	JAVA_HOME=$(HOME)/.sdkman/candidates/java/21.0.4-tem /opt/homebrew/bin/mvn clean package -pl contact-service -am -f ../../pom.xml

upload:
	aws s3 cp $(JAR_PATH) s3://$(S3_BUCKET)/$(S3_KEY) --region $(REGION)

update:
	aws lambda update-function-code \
		--function-name $(FUNCTION_NAME) \
		--s3-bucket $(S3_BUCKET) \
		--s3-key $(S3_KEY) \
		--region $(REGION) \
		--output json | jq '{FunctionName: .FunctionName, CodeSize: .CodeSize, LastModified: .LastModified}'

deploy: build upload update
