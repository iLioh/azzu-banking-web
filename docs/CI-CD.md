# CI/CD Angular → Azure Static Web Apps

Pull requests targeting main run npm ci, runtime dependency audit, Angular tests, production build and artifact checks. Main pushes and manual runs on main publish the exact validated artifact to the existing DEV SWA. No deployment runs from pull requests or forks.

Azure Login uses GitHub OIDC with a managed identity federated only to this repository's dev environment. The SWA deployment token is retrieved during the job and masked; no permanent Azure credentials or deployment tokens are stored as GitHub secrets. GitHub environment dev is restricted to main.

Environment variables: AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, AZURE_RESOURCE_GROUP, SWA_NAME, SWA_URL. These values are identifiers, not secrets. RBAC is scoped to this Static Web App only.

Actions are pinned to commit SHAs. Dependencies are installed using package-lock.json. The published release.json identifies the deployed commit; the smoke check waits for that commit, verifies headers and compiled assets and /auth + /portal/inicio SPA fallback.

Rollback: revert the application commit on main; the same checks and deployment run again. Rerun a failed workflow only after verifying the failure. Backend deployment, authentication federation and custom domain activation are separate tasks.

## DEV configuration

- Site: `stapp-azzu-banking-web-dev`; identity: `id-azzu-spa-cicd-dev`.
- The verified GitHub immutable OIDC subject is `repo:iLioh@108911528/azzu-banking-web@1397034563:environment:dev`.
- The identity has Contributor scoped only to this individual SWA. It has no resource-group/subscription Contributor, RBAC, AKS, BFF or database permissions. Website Contributor does not include staticSites operations in this tenant. An administrator may later replace the assignment with a custom role containing `Microsoft.Web/staticSites/read` and `Microsoft.Web/staticSites/listSecrets/action`.
- All repository/environment variables are identifiers. No permanent deployment token is stored as a GitHub secret.
- The SPA smoke check verifies static delivery only. BFF login and banking functionality still depend on separately configuring and deploying the backend.
