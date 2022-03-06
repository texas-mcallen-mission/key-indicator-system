# key-indicator-system

| Branch | Status |
| --- | --- |
| Main | [![Deploy Script](https://github.com/texas-mcallen-mission/key-indicator-system/actions/workflows/main.yml/badge.svg)](https://github.com/texas-mcallen-mission/key-indicator-system/actions/workflows/main.yml) |
| bert-instance-2 |[![BERT-INSTANCE-2 - ReportCreator-HOTFIX](https://github.com/texas-mcallen-mission/key-indicator-system/actions/workflows/BERT-INSTANCE-2.yml/badge.svg)](https://github.com/texas-mcallen-mission/key-indicator-system/actions/workflows/BERT-INSTANCE-2.yml) |
| [tmm-dev/kic-release](https://github.com/tmm-dev/kic-release) | [![RELEASE](https://github.com/tmm-dev/kic-release/actions/workflows/main.yml/badge.svg)](https://github.com/tmm-dev/kic-release/actions/workflows/main.yml) |

## What Is This?

Tech Jargon: Serverless semi-autonomous push-based tracking system for key indicators for conversion and other mission statistics.

Normal People Speak:  This is an alternative way to track key indicators for conversion & growth that runs in the cloud and doesn't have start-up (or operational!) costs other than time.

## Why do I care?

Well, if you're a mission president for the Church of Jesus Christ of Latter-Day Saints, you have to make a lot of decisions about what to & what not to focus your limited time on improving as a mission.  Data informs good decision making!

Area Book's internal key indicator tracking tools are not the best, and features update at a glacially slow pace.  With this system, tracking a whole new key indicator is as simple as adding it to a Google Form & watching as it shows up in your data on the other end after the first response makes it through, and then figuring out how you want to add it to your reports (you could even collect a bunch of new data *before* figuring out that step, too!)

## Data Collection

We use Google Forms to collect key indicator data- getting people to fill this out is as simple as sending out a link every week (or just telling them to put it in a safe spot & not lose it) and then checking to make sure everyone has submitted.  (In the future, we'd like to add in a way to automatically warn people of errors when they do happen, because that would be really nice.)

### Report Generation

The data generated in this system is directly usable in Google's Data Studio, which allows you to create very nice, modern reports- and create new views very simply and elegantly.  (This is a Google-branded BI tool, and is incredibly powerful & useful.)

You also have the ability to generate zone-, district- and area- reports right off the bat- The code in ``fileSys/`` creates a file structure in Google Drive that the code in ``reports/`` puts Google Sheets into, copied from templates.  This can also be automatically shared and is automatically updated.  The update process for area reports takes about 15-20 minutes for a mission with ~100 areas. 

## How do I get started?

A more comprehensive guide on how to get started- as well as some stuff to make it easier- is in the works.  In the meantime, find somebody with a technical background who learns quickly and that you can trust to work on a project for a bit, and have them get started either trying to get this project working, or learning the specifics of Google AppScript by sticking them on another, more simple project, like automating some of somebody else's job that's really tedious.  Programming experience, or even just knowing how to do fancy stuff in Google Sheets is a plus.

### Other

Code pushed into the ``/main``  branch automatically pushes to ``Github Main Branch`` on ``script.google.com``

Special thanks to [https://github.com/ericanastas/deploy-google-app-script-action](https://github.com/ericanastas/deploy-google-app-script-action) for the pre-work to allow us to automatically get stuff from GitHub to Google!

There is some extra stuff in [texas-mcallen-mission/HLA-code](https://github.com/texas-mcallen-mission/HLA-code) that does some 
