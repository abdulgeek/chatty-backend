terraform {
  backend "s3" {
    bucket = "chatty-server-app-terraform-state" # Your unique AWS S3 bucket
    # create a sub-folder called develop
    key     = "develop/chatapp.tfstate"
    region  = "us-east-1" # Replace with your AWS region
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "ABDUL SAGHEER"
  }
}
