# TipJar Infrastructure

Terraform config for deploying the TipJar frontend to Vercel.

## Setup

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0
- A [Vercel API token](https://vercel.com/account/tokens)
- Vercel-GitHub integration enabled for the repo

### Deploy

```bash
cd infra
export TF_VAR_vercel_api_token=your_token

terraform init
terraform plan
terraform apply
```

### Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `vercel_api_token` | **Yes** | — | Vercel API token |
| `vercel_team_id` | No | `team_DGBZCsMm6Kf0kRZ2R5sEnw6l` | Vercel team ID |
| `git_repository` | No | `SavanovicN/tipjar` | GitHub repo (`owner/repo`) |
| `root_directory` | No | `frontend` | Frontend path in the monorepo |
| `next_public_rpc_url` | No | Public Amoy RPC | Polygon Amoy RPC endpoint |
| `next_public_walletconnect_project_id` | No | — | WalletConnect project ID |

> Deployments are triggered automatically by Vercel on push — Terraform only manages the project configuration.

### Env Vars Set on Vercel

| Vercel Env Var | Source |
|----------------|--------|
| `NEXT_PUBLIC_RPC_URL` | `var.next_public_rpc_url` |
| `NEXT_PUBLIC_APP_URL` | `https://tipjar.vercel.app` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `var.next_public_walletconnect_project_id` |
