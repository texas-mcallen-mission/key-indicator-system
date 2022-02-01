# Continuous Integration Set-Up Guide

## This guide will walk you through what you need to do to get your branch automatically pushing to your GAS project.

***Limitations:*** this guide is specifically for the ``key-indicator-system`` github repo with some setup already done.  To start from scratch or set this up on a different repo, see the guide linked down below for more information.

## Step 1: Set Up Secrets
*this has to be done from the ``tmm-dev`` account because it has ownership of the repository.**
1. Go to repository settings > secrets > actions
2. click ``new repository secret``
    - you'll need two: one for your parent ID & one for your script ID
    - name them something like ``branchname_script_ID`` & ``branchname_parent_ID``
        - please keep these intelligible to make managing them in the future easier!

## Step 2: Copy & Modify ``ci-template.yml``
1. Copy the contents of ``ci-template.yml`` and save them to ``.github/workflows/<BRANCH NAME>.yml``
2. Modifications: 
    1. add your branch:
        - ```yaml
                # LINES 4-7
                workflow_dispatch:
                push:
                # CHANGE THIS TO REFERENCE THE BRANCH YOU WANT TO PUSH
                branches: [<BRANCH NAME GOES HERE>]```
        - do not put quotation marks around your branch name
    2. change the referenced secrets
        - ```yaml
            # Lines 57-64
            # TO UPDATE- MODIFY SCRIPTID & PARENTID TO POINT TO NEW SECRETS
            # read the guide at docs/ci-setup.md!
            - name: modify .clasp.json
                id: modify-clasp
                run: sed -i "s/SCRIPT_ID/$SCRIPTID/;s/PARENT_ID/$PARENTID/" .clasp.json
                env:
                SCRIPTID: ${{ secrets.SCRIPT_ID_SECRET_NAME }}
                PARENTID: ${{ secrets.PARENT_ID_SECRET_NAME }}```
        - replace ``SCRIPT_ID_SECRET_NAME`` with your script id's secret name
        - replace ``PARENT_ID_SECRET_NAME`` with the name of the parent id's secret

## 3. Test!

At this point, you should be able to test the your integration by making a small modification to your code and pushing your changes to your branch. 



# Limitations
this can only run on scripts and documents owned by the TMM account.  To switch to a different account, you'll need to fork the repo and follow the guide below to get initial setup done.

# Acknowledgments:

I used [https://github.com/ericanastas/deploy-google-app-script-action](https://github.com/ericanastas/deploy-google-app-script-action) as a basis for this CI workflow.  For starting from scratch