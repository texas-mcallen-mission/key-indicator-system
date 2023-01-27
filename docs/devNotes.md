# Development Notes

Starting work on a new machine and can't see the sheetCore submodule?  Run ``git submodule update sheetCore``

Working on a codespace and can't push to sheetCore?  Make a new Personal Access Token with access to both and then run ``export GITHUB_TOKEN=[YOUR GITHUB TOKEN]`` - *[where I found that](https://github.com/community/community/discussions/7795)*

Order of operations for setup:
1. import contacts
2. pull form data once
3. run updateFS
4. run createMissingReports
5. full scheduler- updateSpreadsheetTriggers
6. 