terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 4.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

locals {
  env_vars = {
    NEXT_PUBLIC_RPC_URL                  = var.next_public_rpc_url
    NEXT_PUBLIC_APP_URL                  = "https://tipjar.vercel.app"
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = var.next_public_walletconnect_project_id
  }
}

resource "vercel_project" "tipjar" {
  name      = "tipjar"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.git_repository
  }

  root_directory = var.root_directory

  environment = [
    for k, v in local.env_vars : {
      key    = k
      value  = v
      target = ["production", "preview"]
    }
  ]
}
