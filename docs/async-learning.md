# Learning how to use async functions

apparently, JavaScript only uses a single thread.  This means that asynchronous computing is a lot more LAME than it should be.

```pre- real async work:  3:18:57 PM Info Async modify completed for  ZONE  in  -125 milliseconds
    3:23:23 PM Info Async modify completed for  DISTRICT  in  -705 milliseconds


promises.push first run: 
UNCACHED:
3:27:19 PM Info Async modify completed for  ZONE  in  -336 milliseconds
CACHED:
3:29:08 PM Info Async modify completed for  DISTRICT  in  -28 milliseconds
3:29:08 PM Info SCOPE:, DISTRICT ,Updating reports took,  322  ms
3:29:36 PM Notice Execution completed

3:31:32 PM Info Async modify completed for  ZONE  in  -236 milliseconds
3:31:32 PM Info SCOPE:, ZONE ,Updating reports took,  324  ms
3:31:42 PM Notice Execution completed

3:32:59 PM Info Async modify completed for  ZONE  in  -550 milliseconds
3:32:59 PM Info SCOPE:, ZONE ,Updating reports took,  13  ms
3:33:12 PM Notice Execution completed


removed config page sets, also ditched try-catch on the setting
3:43:38 PM Info Async modify completed for  DISTRICT  in  313 milliseconds
3:44:05 PM Notice Execution completed

changed stuff up:
4:02:49 PM Info Async modify completed for  AREA  in  -282 milliseconds
4:05:31 PM Notice Execution completed
```

basically this means that I'm going as quickly as JavaScript will let me go.  Time to figure out how to split things up into multiple functions or something, I guess
