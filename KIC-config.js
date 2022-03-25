//@ts-check
/*
KIC-config
General and debugging configuration parameters
*/

let INTERNAL_CONFIG = {
  // docIds
	docIds_kicFormId: "This, along with the ones below, should probably be set in env secrets", //The Document ID of the Key Indicators for Conversion Report Google Form (where missionaries submit their KICs every Sunday).    gcopy:'1CbCGdXXjPmQmpLKJAaER0cSYSGrb3ES3y2XGpr3czEw'    live:'1Zc-3omEIjAeQrmUxyG8YFk4PdnPf37XiFy3PRK2cP8g'
	
  reportCreator: {
    docIDs: {
      zoneTemplate: "ZONE TEMPLATE ID Goes Here",
      distTemplate: "Stick a district template here, if ya want",
      areaTemplate: "same as above, but for areas",
    },
    outputDataSheetName: "Data",
    configPageSheetName: "config",
    kicDataStoreSheetName: "Data",
  },

  // general

  general_areaNameQuestionTitle: "Area Name",

  general_deleteOldResponsesAgeLimit: 0, //The max age, in days, of a response before it is deleted (from the Form, not the Google Sheet). If set to 0, old responses will never be deleted.

  // dataFlow

  dataFlow: {
    forceAreaIdReloadOnUpdateDataSheet: false,

    areaId_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset

    areaId_cacheKey: "butterflies and clouds", //ID to use when storing areaIDs in the cache

    allSheetData_cacheEnabled: true, //Cache allSheetData, the object returned by constructSheetData()

    allSheetData_cacheExpirationLimit: 1800, //Maximum time in seconds before the cache gets reset

    allSheetData_cacheKey: "puppies and flowers", //ID to use when storing allSheetData in the cache

    missionOrgData_cacheEnabled: false, //[unimplemented] Cache missionOrgData, the object returned by getMissionOrgData()

    maxRowToMarkDuplicates: 500, //If set to -1, the full sheet will be checked (which takes a long time!). If set to 0, duplicates will not be marked.

    log_importContacts: false,
    log_dataMerge: false,
    log_responsePulled: false,
    log_duplicates: false,
    skipMarkingPulled: false, //Stops marking Form Responses as having been pulled into the data sheet

    skipMarkingDuplicates: false, //TODO Re-implement?

    freezeContactData: false,

    formColumnsToExcludeFromDataSheet: ["responsePulled", "submissionEmail"],
  },

  commonLib: {
    log_access_info: false, // if set to true, logger will tell you whether or not files are accessible
    log_display_info: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display extra debug information
    log_display_info_extended: false, // if set to true, sendDataToDisplay & sendReportToDisplay will display even more debug information
    log_time_taken: true, // if set to true, sendDataToDisplay & sendReportToDisplay will display how much time they took to run.  Pretty useful IMO
  },

  // fileSystem
  fileSystem: {
    reportLevel: { zone: "Zone", dist: "District", area: "Area" }, //Theoretically, since there's no difference between this anywhere you should be able to change this to be whatever gibberish you want as long as they're unique.  These strings also included in folder naming if INCLUDE_SCOPE_IN_FOLDER_NAME is set to true, so don't make them too pithy.

    updateSheetProtectionsOnLoad: false, //WARNING: If set to true, loading the filesystem will take a VERY long time!

    includeScopeInFolderName: true,

    freezeFilesys: false, //TODO Re-implement? Currently unimplemented

    log_existing_folders: false,

    log_filesys: false, //TODO Update references
    log_update: false,

    log_fileShare: false,

    LOG_OLD_sendReportToDisplayV3_: false, //TODO Update references
    log_sendReportToDisplayV3_: false,
  },

  // triggers
	triggers: {
		installable: {
			onOpen: true,
			onEdit: false, //Not currently used
		},
		timeBased: {
			updateForm: true,
			updateDataSheet: true,
			importContacts: true,
			updateFileSystem: true,
			updateAreaReports: true,
			updateDistReports: true,
			updateZoneReports: true,
			shareFileSystem: false,
		},
		menu: {
			updateDataSheet: true,
			updateFileSystem: false,
			updateAreaReports: true,
			updateDistReports: true,
			updateZoneReports: true,
			importContacts: true,
			markDuplicates: true,
			loadAreaIds: true,
		}
  }
};

// this combines the two objects together- the bottom ones overwrite the top ones.
//@ts-ignore
var _ = lodash.load();

function test_lodash() {
    console.log(CONFIG);
    // if you stick something in override_secret_data you'll be able to notice the changes.
}

// stick things here that you want to override your secret data- mostly for testing, or when you don't have access to modify github action secrets.
const OVERRIDE_SECRET_DATA = {
  //   dataFlow: { skipMarkingPulled: true } // easily re-commentable for convenience
};

var CONFIG = _.merge(INTERNAL_CONFIG,GITHUB_SECRET_DATA,OVERRIDE_SECRET_DATA)
