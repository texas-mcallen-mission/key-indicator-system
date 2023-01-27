# Manual Full System Test

I honestly don't know how I would automate this, so here's a written out guide of everything you need to check

## sheetCore

- This thing is pretty bulletproof, but to make sure everything is configured properly, consider deleting some of the sheets that are automatically generated and see what happens.

## IMOS Data

- delete the contactData sheet and run ``run_importContacts`` from ``aa-shortcuts.gs``
- verify that ``contactData`` sheet exists and that the areas and information are correct

## Data Flow

- add an entry to form responses.  (You can create this manually in Sheets, submit a form, copy-paste an entry, or just clear the value stored in ``isPulled``)
- Make sure that ``skip_marking_duplicates`` is set to false if you're on a live release version
- run ``run_updateDataSheet`` from ``aa-shortcuts.gs``.
  - if you get an error, make sure that your area names are up to date with ones in Contact Data

## Report Updater

- *optional* - delete the ``reports`` folder and delete the ``areaFS``,``distFS``, & ``zoneFS`` tabs
- Run ``run_reportTester`` in ``aa-shortcuts.gs``
- This will take a minute because it'll create templates for *all* areas, districts, and zones
- Check the execution log to see what groups updated, and look at a report from each of the three report types.
  - if you get a message in the log that says ``Exiting: Nothing to Update!`` then that means you're probably attempting this on a live system.  In that case, just verify that reports have been updated recently.


## Access Control

- Run ``run_shareFileSys`` and verify that files in``reports`` are shared with the proper area emails.
  - Running this from a shared drive will not work at the moment, unfortunately.
  - The easiest way to do this is hop down to zone / area you don't know and see if the folder is shared to a proper area email.


## Final Thoughts

At this point, you should be able to run ``setUpTriggers`` to have a fully automated system!