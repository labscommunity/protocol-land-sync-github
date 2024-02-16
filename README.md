# Protocol Land Sync GitHub

The Protocol Land to GitHub Sync tool streamlines the process of synchronizing your repositories from Protocol Land to GitHub, ensuring your projects are up-to-date across both platforms.

## How to Use

To synchronize your Protocol Land repository with GitHub, you'll need to configure a GitHub Action in your GitHub repository and set the corresponding settings in your Protocol Land repository.

## Setting Up: A Step-by-Step Guide

> [!IMPORTANT]
>
> If you're working with a **private repository** on Protocol Land, you'll need the Arweave wallet.

### Setting Up on GitHub

1. **Starting Point**:

- If your repository exists **only on Protocol Land**, create a repository on GitHub.
- If your repository exists **only on GitHub**, create a repository on Protocol Land.
- If you **don't have a repository on either** platform, create a new repository on both Protocol Land and GitHub.

2. **Configuring GitHub Secrets**:

- Navigate to your GitHub repository's **Settings > Secrets and variables > Actions > New Repository Secret**.
- **(Optional)** For syncing private repositories, add a new secret named **`WALLET`** with your Arweave wallet's JWK as the value.
- Add another secret named **`PL_REPO_ID`** with your Protocol Land Repository ID as the value. Your Protocol Land Repo ID can be found in the repository's URL, e.g., **`6ace6247-d267-463d-b5bd-7e50d98c3693`**.

3. **Setting Up the GitHub Workflow**:

- Clone your Protocol Land or GitHub repository, then create a new file named **`protocol-land-github-sync.yml`** inside **`.github/workflows`** (make this folder if it doesn't exist).
- Copy the provided workflow content into this file, commit, and push the changes to both GitHub and Protocol Land.

```yaml
name: Protocol Land to GitHub Sync

on:
  workflow_dispatch:
    inputs:
      forcePush:
        description: "Force push"
        required: false
        default: "false"

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3
      - name: Sync repo to GitHub
        run: npx protocol-land-sync-github
        env:
          GITHUB_TOKEN: ${{ secrets.WORKFLOW_TOKEN || secrets.GITHUB_TOKEN }}
          WALLET: ${{ secrets.WALLET }}
          PL_REPO_ID: ${{ secrets.PL_REPO_ID }}
          FORCE_PUSH: ${{ inputs.forcePush }}
          GH_REPO_NAME: ${{ github.repository }}
```

### Setting Up on Protocol Land

1. **Finalizing Setup**:

- Ensure your repository is pushed to both GitHub and Protocol Land to begin synchronization.

2. **Configuring Protocol Land Repository Settings**:

![image](https://github.com/pawanpaudel93/protocol-land-sync-github/assets/11836100/65483d12-eb1b-4453-b584-55709dce8562)

Goto repository settings on Protocol Land. Then configure the following:

- **Switch**: Click the switch to enable GitHub sync. You can disable it whenever GitHub Sync is not required. You can still use the `Trigger Sync` button for manual trigger of GitHub sync workflow.
- **Repository**: Write your Github repository name with username. For example, `labscommunity/protocol-land`.
- **Branch**: Select the branch that contains the GitHub workflow file.
- **Workflow name**: Write your workflow file name. For example, `protocol-land-github-sync.yml`.
- **Personal Access Token (PAT)**: You'll also need a Personal Access Token (PAT) from GitHub with the appropriate permissions to trigger the GitHub workflow. This PAT is securely stored and encrypted with your wallet. To create PAT, goto [Fine-grained tokens](https://github.com/settings/tokens?type=beta) to create a PAT. Set a token name, expiration, repository access `(All repositories or Only select repositories)` and permissions `(Repository permissions -> Actions -> Read and write)`.

> [!NOTE]
>
> If you get this similar error: ![image](https://github.com/pawanpaudel93/protocol-land-sync-github/assets/11836100/4429b957-71a5-4b50-815a-2e56ecaeef2a) in the workflow run, you need to create a new Personal Access Token (PAT) with Repository permissions (**Contents: Read and write** and **Workflows: Read and write**). Now, add another secret named **`WORKFLOW_TOKEN`** with your PAT created as the value.

3. **Synchronization Activation**:

- With everything set up, any new commits made to your Protocol Land repository, whether through the UI or CLI, will automatically trigger the GitHub workflow to sync your repository on GitHub.

By following these steps, you'll have successfully set up synchronization between your Protocol Land and GitHub repositories, enabling seamless updates and collaboration across platforms.
