import { IAnalyticsActionCause } from "coveo-search-ui";

export const analyticsActionCauseList = {
    /**
     * Identifies the search and custom event that gets logged when a user clicks the Go Back link after an error page.
     *
     * `actionCause`: `'errorBack'`
     * `actionType`: `'errors'`
     */
    errorBack: <IAnalyticsActionCause>{
        name: 'errorBack',
        type: 'errors'
    },
    /**
     * Identifies the search and custom event that gets logged when a user clears the query box after an error page.
     *
     * `actionCause`: `'errorClearQuery'`
     * `actionType`: `'errors'`
     */
    errorClearQuery: <IAnalyticsActionCause>{
        name: 'errorClearQuery',
        type: 'errors'
    },
    /**
     * Identifies the search and custom event that gets logged when a user clicks the Retry link after an error page.
     *
     * `actionCause`: `'errorRetry'`
     * `actionType`: `'errors'`
     */
    errorRetry: <IAnalyticsActionCause>{
        name: 'errorRetry',
        type: 'errors'
    },
}