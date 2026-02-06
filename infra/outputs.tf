output "project_url" {
  value       = "https://tipjar.vercel.app"
  description = "The Vercel app URL"
}

output "project_id" {
  value       = vercel_project.tipjar.id
  description = "The Vercel project ID"
}
