variable "vercel_api_token" {
  type        = string
  sensitive   = true
  description = "Vercel API token"
}

variable "vercel_team_id" {
  type        = string
  description = "Vercel team ID"
  default     = "team_DGBZCsMm6Kf0kRZ2R5sEnw6l"
}

variable "git_repository" {
  type        = string
  description = "GitHub repository in format 'owner/repo'"
  default     = "SavanovicN/tipjar"
}

variable "root_directory" {
  type        = string
  description = "Root directory of the frontend within the repo"
  default     = "frontend"
}

# Frontend environment variables

variable "next_public_rpc_url" {
  type        = string
  description = "Polygon Amoy RPC URL"
  default     = "https://polygon-amoy-bor-rpc.publicnode.com"
}

variable "next_public_walletconnect_project_id" {
  type        = string
  description = "WalletConnect project ID (optional)"
  default     = ""
}
