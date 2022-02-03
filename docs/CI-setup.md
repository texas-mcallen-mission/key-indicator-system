# Continuous Integration Set-Up Guide

This guide will walk you through what you need to do to get your branch automatically pushing to your Google Apps Script project.

***Limitations:*** This guide is specifically for the `key-indicator-system` github repo with some setup already done. To start from scratch or set this up on a different repo, see the guide linked in the acknowledgements.

## Step 1: Set up secrets

*This has to be done from the `tmm-dev`account because it has ownership of the repository.*

1. In the `key-indicator-system` respository, go to Settings > Secrets > Actions
2. Click `New repository secret`
3. Define a secret whose value is the Doc ID of the parent file in Google Drive, found in the file\'s URL
    - Name it something like `BRANCHNAME_PARENT_ID`.
    - Please keep it intelligible to make managing them in the future easier!
4. Define another secret containing your script ID, found in Settings in the GAS Editor

## Step 2: Copy & modify ci-template.yml

1. Copy the contents of `ci-template.yml` and save them to `.github/workflows/<BRANCH NAME>.yml`
2. Add your branch to `<BRANCH NAME>.yml`
    - Do not put quotation marks around your branch name.
    - Example (lines 4-7):

      ```yaml
        workflow_dispatch:
        push:
          # replace myBranchName with the name of your branch
          branches: [myBranchName]

3. Change the referenced secrets

    - Replace `SCRIPT_ID_SECRET_NAME` with the name of your script ID\'s secret
    - Replace `PARENT_ID_SECRET_NAME` with the name of your parent ID\'s secret
    - Example (lines 63-65):

      ```yaml
        #Replace SCRIPT_ID_SECRET_NAME and PARENT_ID_SECRET_NAME with the names of the corresponding secrets
        env:
          SCRIPTID: ${{ secrets.SCRIPT_ID_SECRET_NAME }}
          PARENTID: ${{ secrets.PARENT_ID_SECRET_NAME }}

## Step 3: Test the code

At this point, you should be able to test your integration by making a small modification to your code and pushing your changes to your branch. After refreshing the browser, the change should be reflected in Google Apps Script.

## Limitations

This can only run on scripts and documents owned by the TMM account. To switch to a different account, you will need to fork the repo and follow the guide below to get initial setup done.

## Acknowledgments

I used [https://github.com/ericanastas/deploy-google-app-script-action](https://github.com/ericanastas/deploy-google-app-script-action) as a basis for this CI workflow.
