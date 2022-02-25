# Continuous Integration Set-Up Guide

This guide will walk you through what you need to do to get your branch automatically pushing to your Google Apps Script project.

***Limitations:*** This guide is specifically for the `key-indicator-system` github repo with some setup already done. To start from scratch or set this up on a different repo, see the guide linked in the acknowledgements.

## Step 1: Set up Repository secrets

*This has to be done from an account that can access & modify repository secrets.*

#### Setting up secrets for the uninitiated:
1. In the `key-indicator-system` respository, go to Settings > Secrets > Actions
2. Click `New repository secret`


### Set up Script ID's
1. Define a secret whose value is the Doc ID of the parent file in Google Drive, found in the file\'s URL
    - Name it something like `BRANCHNAME_PARENT_ID`.
    - Please keep it intelligible to make managing them in the future easier!
2. Define another secret containing your script ID, found in Settings in the GAS Editor

### `CLASPRC_JSON`

The `clasp` command line tool uses a `.clasprc.json` file to store the current login information. The contents of this file need to be added to a `CLASPRC_JSON` secret to allow the workflow to update and deploy scripts.

1. Login to clasp as the user that should run the workflow: 
   1. Run `clasp login` 
   2. A web browser will open asking you to authenticate clasp. Accept this from the account you want the workflow to use.
2. Open the `.clasprc.json` file that is created in the home directory (`C:\Users\{username}` on windows, and `~/.clasprc.json` on Linux)
3. Copy the contents of `.clasprc.json` into a new secret named `CLASPRC_JSON`

### `REPO_ACCESS_TOKEN`
A GitHub personal access token must be provided to the workfow to allow it to update the `CLASPRC_JSON` secret configured about when tokens expire and refresh.

1. Create a new [GitHub personal access token](https://github.com/settings/tokens/new) with `repo` scope.
2. Copy the token into a new secret named `REPO_ACCESS_TOKEN`




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

3. Update secret names in workflow

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

## Step 4: Typescript Integration!

If you want to use Typescript and have ``clasp`` automatically compile things for you, here's what you need to do:



### Install [Google AppScript Types](https://www.npmjs.com/package/@types/google-apps-script) locally:

run ``npm install --save @types/google-apps-script`` from your current working directory.

you should see a folder named ``node_modules`` show up in your directory

### Create a ``tsconfig.json`` file

Sample contents:
```json
{
    "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "lib": ["ESNext"],
        "target": "ES6",
        "types": [
            "google-apps-script"
        ],
        "outDir": "./"
        
    }
}
```


## Limitations

This isn't perfect.

## Acknowledgments

I used [https://github.com/ericanastas/deploy-google-app-script-action](https://github.com/ericanastas/deploy-google-app-script-action) as a basis for this CI workflow.
