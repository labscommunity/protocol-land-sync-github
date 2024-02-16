# Protocol Land Sync GitHub

The Protocol Land Sync GitHub package simplifies the process of syncing Git repositories from Protocol Land to GitHub.

## Usage

To sync a repository from Protocol Land to GitHub, you should set up a GitHub Action in your repository on GitHub and save configuration related to it on Protocol Land Repository settings.

### Set Up GitHub Action & Protocol Land Github Sync Configuration

> [!IMPORTANT]
>
> You need an Arweave wallet only if the Repository you want to sync from Protocol Land to GitHub is a private repository.

### On GitHub

1. There might be different conditions:

- **You have a Repository on Protocol Land only**: Create a new repository on GitHub to sync from Protocol Land.
- **You have a Repository on GitHub only**: Create a new Repository on Protocol Land to sync to GitHub.
- **You don't have Repository on both**: Create a new Repository on both Protocol Land and GitHub.

  Then, on Github repository go into: **Settings Tab -> Secrets and variables -> Actions -> New Repository Secret**

2. **(Optional)** Add a new secret with `WALLET` for "Name" and your Arweave wallet's JWK in the `Secret` field, and click the "Add secret" button. `WALLET` is only required for Protocol Land private repositories to sync to GitHub.

3. Add a new secret with `PL_REPO_ID` for `Name` and your Protocol Land Repo ID in the `Secret` field, and click the `Add secret` button. You could also write it in the workflow file itself instead of using a secret for it. For example: A Protocol Land Repo looks like: <https://protocol.land/#/repository/6ace6247-d267-463d-b5bd-7e50d98c3693> and `6ace6247-d267-463d-b5bd-7e50d98c3693` is the Repo ID.

4. Setup GitHub Workflow: Now clone the repository and Create a file called `protocol-land-github-sync.yml` in a subfolder called `.github/workflows` under your repo's root (create the folder if it doesn't exist). Paste this workflow content below and commit and push to both GitHub and Protocol Land.

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
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          WALLET: ${{ secrets.WALLET }}
          PL_REPO_ID: ${{ secrets.PL_REPO_ID }}
          FORCE_PUSH: ${{ inputs.forcePush }}
          GH_REPO_NAME: ${{ github.repository }}

```

### On Protocol Land

5. Now, Make sure the repository is pushed to both GitHub and Protocol Land to start syncing from Protocol Land to GitHub.

6. As seen in the image below, Goto repository settings on Protocol Land. Then configure the following:

![image](https://github.com/pawanpaudel93/protocol-land-sync-github/assets/11836100/65483d12-eb1b-4453-b584-55709dce8562)

- **Switch**: Click the switch to enable GitHub sync. You can disable it whenever GitHub Sync is not required. You can still use the `Trigger Sync` button for manual trigger of GitHub sync workflow.
- **Repository**: Write your Github repository name with username. For example, `labscommunity/protocol-land`
- **Branch**: Select the branch that contains the GitHub workflow file.
- **Workflow name**: Write your workflow file name. For example, `protocol-land-github-sync.yml`.
- **Personal Access Token (PAT)**: PAT is needed to trigger the GitHub workflow using an API endpoint. It is saved by encrypting with the wallet so it cannot be used by others.
  - To create PAT, goto [Fine-grained tokens](https://github.com/settings/tokens?type=beta) to create a PAT. Set a token name, expiration, repository access `(All repositories or Only select repositories)` and permissions `(Repository permissions -> Actions -> Read and write)`.

7. Now if you have done all the above correctly and when you make a new commit to Protocol Land repository from UI or CLI, the GitHub workflow is triggered to sync the repository on GitHub.
