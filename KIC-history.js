/*
 _   __             _           _ _           _                    __                         
| | / /            (_)         | (_)         | |                  / _|                        
| |/ /  ___ _   _   _ _ __   __| |_  ___ __ _| |_ ___  _ __ ___  | |_ ___  _ __               
|    \ / _ \ | | | | | '_ \ / _` | |/ __/ _` | __/ _ \| '__/ __| |  _/ _ \| '__|              
| |\  \  __/ |_| | | | | | | (_| | | (_| (_| | || (_) | |  \__ \ | || (_) | |                 
\_| \_/\___|\__, | |_|_| |_|\__,_|_|\___\__,_|\__\___/|_|  |___/ |_| \___/|_|                 
             __/ |                                                                            
            |___/                                                                             
                                   _                                                _   _     
                                  (_)               ___                            | | | |    
  ___ ___  _ ____   _____ _ __ ___ _  ___  _ __    ( _ )     __ _ _ __ _____      _| |_| |__  
 / __/ _ \| '_ \ \ / / _ \ '__/ __| |/ _ \| '_ \   / _ \/\  / _` | '__/ _ \ \ /\ / / __| '_ \ 
| (_| (_) | | | \ V /  __/ |  \__ \ | (_) | | | | | (_>  < | (_| | | | (_) \ V  V /| |_| | | |
 \___\___/|_| |_|\_/ \___|_|  |___/_|\___/|_| |_|  \___/\/  \__, |_|  \___/ \_/\_/  \__|_| |_|
                                                             __/ |                            
                                                            |___/                             
 _   _    ___                                                                                 
| | | |  /   |                                                                                
| | | | / /| |                                                                                
| | | |/ /_| |                                                                                
\ \_/ /\___  |                                                                                
 \___/     |_/                                                                                



You might be wondering why a few missionaries spent a bunch of time working on a thing not *directly* related to our missionary purpose.

History:

The original way that key indicators were reported was via text - the districts reported their numbers to their district leaders, who then in turn reported their statistics to their zone leaders, who then had to call in their stats to one poor senior missionary in the office who was responsible for manually tabulating the data and turning it into a usable format by hand every week. Which took literally hours.

There were a lot of problems with this system, in large part because there was a lot of room for error. Areabook was also pretty inconsistent. It was easy for missionaries to enter data wrong and impossible to tell when they did, it was very hard to find and correct errors when they come up, and it had basically no flexibility if the mission president decided to change something (like what counts as a New Person) or track anything else (like Member Present Lessons, Facebook efforts, or where baptisms were coming from).

Elder Paul Hathaway, then Assistant to the President, had the original idea of building a Key Indicators for Conversion Tracking System using Google Sheets. Having the missionaries simply submit numbers, rather than indirectly calculating Key Indicators from Contacts and Events in Areabook, would give far more flexibility. Under Mission President Jared Ocampo's direction, he built and implemented Version 1 and Version 2 in late 2020 using Google Sheets and Google Apps Script.

Version 3 was an extension of V2 built over the summer of 2021, implemented primarily by Elder Nathaniel Gerlek with Elder Hathaway's help. It added tracking of Retention Rates and basic error detection and correction, as well as making the sheets much easier for missionaries and missionary leaders to use. It was still very hardcoded however, and required a decent amout of maintenance when areas or zones changed. Missionary leadership especially had to know exactly how to use it the right way or risk having it error out.

Some months later, in the winter of 2021-22, Elder Gerlek and Elder Joseph Robertson began a collaborative effort to rebuild the entire system from the ground up. Using Google Sheets in combination with other applications within the Google Suite, including Google Contacts, Google Forms and Data Studio, the system could be made far more powerful, flexible, expandable, and robust.

This is version 5, a complete rewrite of the entire system. Updates and improvements include:
/**
 * Using Google Forms to input data, allowing more powerful data validation
 * Automatic handling of additional Key Indicators
 * Acess control
 * Leadership data summaries
 * Live automatic reports for District Councils and Zone Leadership Councils
 */




















