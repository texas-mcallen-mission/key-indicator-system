# Continuous Integration Notes

## Prerequisites

A very helpful jumping-off point at <https://github.com/ericanastas/deploy-google-app-script-action> REALLY helped us get started.
This document is more or less just to help me understand what it is that I need to do to adapt that guy\'s stuff to my purposes.

## Requirements

Google Clasp, referenced through GitHub Actions, and the Workflow code:

1. ``.clasprc.json`` - This has some really important & powerful information in it. It\'s basically how CLASP authenticates that you\'re you. Has to be gotten locally and is in a somewhat weird spot.
2. ``.clasp.json`` - In order to use CLASP from the command line locally you need two versions of it: one for your PC and one for Github.  This requires it to be in ``.gitignore``.
3. ``main.yml`` - This is the Workflow code. It requires some set up:
    - First you have to set up some secret tokens (covered in the guide) because of how scary ``.clasprc.json`` would be if it got into the wrong person\'s hands
    - For the workflow to work, ``rootDir`` in ``.clasp.json`` has to be set to ``./``

## Pulling it apart

The goals are as follows:

1. Get separate sets of CI stuff working so that I can automatically push a release branch into the release Sheet & the main branch into the dev Sheet automatically.
    - This is important because we have automated triggers that things tell us when stuff breaks.
2. Have the local ``.clasp.json`` file co-exist with the server version.
    - This would mean that CI and local CLASP wouldn\'t interfere with each other.
    - However, if we\'re working exclusively off the cloud now using ``vscode.dev`` & ``github.dev``, this is a lot less of a problem.
3. (Possibly not) Get this stable enough that we can auto-push into a live release eventually.

- Side goal: implement deep error tracking & timing so that we can make a dashboard in DataStudio to monitor program health and potentially identify problem spots.

## ``.clasp.json``

```json
{
    "scriptId": "ID OF GOOGLE SCRIPT",
    "rootDir": "HAS TO BE ./ FOR CI",
    "parentId": [
        "Document ID if it has a Google Document 'container'"
    ]
}
```

## ``main.yml``

To the untrained programmer that I am, it was mind-blowing to realize that an entire VM lives and dies based on some YAML.

```yaml
name: Deploy Script

on:
  workflow_dispatch:
  push:
    branches: [main, develop]
  release:
    types: [published]
  schedule:
    - cron: "0 0 * * SUN"

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Install clasp #this is simple enough
        id: install-clasp
        run: sudo npm install @google/clasp@2.4.1 -g

      - name: Write CLASPRC_JSON secret to .clasprc.json file # moves the secret at runtime.  SMAART
        id: write-clasprc
        run: echo "$CLASPRC_JSON_SECRET" >> ~/.clasprc.json
        env:
          CLASPRC_JSON_SECRET: ${{ secrets.CLASPRC_JSON }}

      - name: Check clasp login status
        id: clasp_login
        run: clasp login --status
        # simple enough.  on my machine it returns
        # you are logged in as <EMAIL>.

      - name: Save current .clasprc.json contents to CLASPRC_JSON_FILE environment variable
        id: save-clasprc
        run: |
          echo ::add-mask::$(tr -d '\n\r' < ~/.clasprc.json)
          echo "CLASPRC_JSON_FILE=$(tr -d '\n\r' < ~/.clasprc.json)" >> $GITHUB_ENV
        # basically the best I can understand it (I don't have access to a VM RN)
        # takes the secret loaded in the second step, parses it somehow and sends it to an environmental variable 
      
      - name: Save CLASPRC_JSON_FILE environment variable to CLASPRC_JSON repo secret
        id: set-clasprc-secret
        if: ${{ env.CLASPRC_JSON_FILE != env.CLASPRC_JSON_SECRET  }}
        uses: hmanzur/actions-set-secret@v2.0.0
        # from https://github.com/hmanzur/actions-set-secret - apparently locks in a version as well.
        # not sure quite what it does yet.
        env:
          CLASPRC_JSON_SECRET: ${{ secrets.CLASPRC_JSON }}
        with:
          name: "CLASPRC_JSON"
          value: ${{ env.CLASPRC_JSON_FILE }}
          repository: ${{ github.repository }}
          token: ${{ secrets.REPO_ACCESS_TOKEN }}
        # guess the end result here is that we're now ready to check some stuff out.
        # In my understanding the reason why most of the above is necessary is because we can't do stuff 
      - name: Checkout repo
        id: checkout-repo
        if: ${{github.event_name != 'schedule' }}
        uses: actions/checkout@v2

      - name: Set scriptId in .clasp.json file
        id: set-script-id
        if: ${{ github.event_name != 'schedule' && env.SCRIPT_ID}}
        run: jq '.scriptId = "${{env.SCRIPT_ID}}"' .clasp.json > /tmp/.clasp.json && mv /tmp/.clasp.json .clasp.json
        env:
          SCRIPT_ID: ${{secrets.SCRIPT_ID}}

      - name: Push script to scripts.google.com
        id: clasp-push
        if: ${{ github.event_name != 'schedule'}}
        run: clasp push -f

      - name: Deploy Script
        id: clasp-deploy
        if: ${{env.DEPLOYMENT_ID && (github.event_name == 'release' || (github.event_name == 'push' && github.ref == 'refs/heads/main'))}}
        run: clasp deploy -i "$DEPLOYMENT_ID" -d "$GITHUB_REF"
        env:
          DEPLOYMENT_ID: ${{ secrets.DEPLOYMENT_ID }}
  # dump-context:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - name: Dump GitHub context
  #       env:
  #         GITHUB_CONTEXT: ${{ toJSON(github) }}
  #       run: echo "$GITHUB_CONTEXT"
  #     - name: Dump job context
  #       env:
  #         JOB_CONTEXT: ${{ toJSON(job) }}
  #       run: echo "$JOB_CONTEXT"
  #     - name: Dump steps context
  #       env:
  #         STEPS_CONTEXT: ${{ toJSON(steps) }}
  #       run: echo "$STEPS_CONTEXT"
  #     - name: Dump runner context
  #       env:
  #         RUNNER_CONTEXT: ${{ toJSON(runner) }}
  #       run: echo "$RUNNER_CONTEXT"
  #     - name: Dump strategy context
  #       env:
  #         STRATEGY_CONTEXT: ${{ toJSON(strategy) }}
  #       run: echo "$STRATEGY_CONTEXT"
  #     - name: Dump matrix context
  #       env:
  #         MATRIX_CONTEXT: ${{ toJSON(matrix) }}
  #       run: echo "$MATRIX_CONTEXT"
  ```
