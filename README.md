## Google Ads - Account structure script



## **Context**

Search advertising has changed, in large part thanks to machine-learning. Over the years, Google has incorporated more and more machine-learning into products like Smart Bidding, DSA, RSA, Optimized Ad rotation, DDA, Ad extension selection, Semantic Keywords, etc.

Thanks to these advancements, granular account structures are no longer necessary. They segment traffic and limit learning data for some machine-learning based solutions, they require unnecessary upkeep and time commitment to manage, and their complexity can lead to operational mistakes. Furthermore, Smart Bidding opens the door for simpler structures by analyzing thousands of signals in real time to define optimal bids for each search query.

Adopting a simpler account structure (aka. Account Structure for Modern Search) leads to:



*   Larger volume of learning data at ad group level, crucial to improving performance of components such as RSA. In general, machine learning needs volume as well as variety to learn faster and deliver even better results.
*   Simpler management (up to 20% of time used to manage an account saved and repurposed on higher-value, strategic tasks)
*   Easier to identify insights, detect patterns and identify opportunities while lowering the margin of error as accounts are streamlined.

## **Purpose of the account structure script**



In order to help identify your account structure improvement opportunities, this Google Ads script will generate a report in Google Sheets with the following KPI (see details below):


#### Landing pages analysis

*   KPI
    *   \# of unique landing pages
    *   Ratio of standard ad groups per unique landing page
*   Rationale
	*   These KPI highlight the level of granularity of the account at landing page level: the less granular it it, the larger the volume of learning data will be for the assets targeting each landing page
*   Recommendations
    *   For starting ratios above 1 : 1 aim at lowering it 1 : 1 or slightly below by merging ad groups targeting the same landing page with the same business objective and using DSA
    *   Ratios below 1 : 1 are normal and mean that some landing pages are exclusively covered by DSA ad groups



#### Ad groups analysis



*   KPI
    *   \# of ad groups - standard + DSA
    *   % of investment on standard ad groups with a RSA at Ad Strength above "Good"
    *   % of investment on DSA ad groups
    *   % of standard ad groups >= 3k impressions/week (or the threshold of your choice)
    *   Average impressions per standard ad group with &lt; 3k impressions/week (or the threshold of your choice)
*   Rationale
	*   These KPI highlight the readiness of ad groups for simpler account structure by ensuring that the potential of ad formats is maximized, and that standard ad groups get enough learning data from impressions
*   Recommendations
    *   Leverage the full creative possibilities of RSA to ensure that a relevant ad can be displayed for each reason to visit the landing page
    *   Use DSA to cover the long tail of landing pages
    *   Ideally the % of investment on standard ad groups with a RSA at Ad Strength above "Good" + on DSA = 100%
    *   Merge relevant ad groups to maximize the % of standard ad groups >= 3k impressions/week
    *   Ensure semantic coverage is not limited to help average impressions per standard ad group &lt; 3k impressions/week get closer to this value




#### Campaigns analysis



*   KPI
    *   \# of search campaigns
    *   \# of experiment search campaigns
    *   % of investment on conversion-based smartbidding campaigns
    *   Bidding strategies
    *   % of search campaigns >= 10 conversions/week (or the threshold of your choice)
    *   Average conversions on campaigns with &lt; 10 conversions/week (or the threshold of your choice)
    *   \# of campaigns with IS lost due to budget (account level)
    *   Impression Share lost due to budget (campaign level)
*   Rationale
	*   These KPI highlight the readiness of campaigns for simpler account structure by ensuring they use the right smartbidding strategy, that they get enough learning data from conversions, and that they do not lose impression share due to limited budget
*   Recommendations
    *   Increase average conversions by merging campaigns with similar business objective to increase traffic on creatives, generate more training data for algorithms, and have more insightful & less volatile reporting
    *   Use conversion-based smartbidding strategies aligned with your business objectives
    *   Ensure campaigns do not lose impression share due to limited budget



#### Keywords analysis



*   KPI
    *   \# of active keywords with Impressions > 0
    *   % of active keywords with &lt; 10 impressions
*   Rationale
	*   These KPI highlight the level of granularity of keywords portfolios and the opportunity of making them lighter
*   Recommendations
    *   Take advantage of broad match types to lighten keyword portfolio and make maintenance easier

### **Features**

*   Reports can be created at different levels
    *   For all accounts in a MCC
    *   For a list of accounts in a MCC
    *   For a specific account (this level of analysis adds campaign level reporting and a landing page report)
*   Choice of the period for the analysis
    *   Default: previous week
    *   Custom: period of your choice
*   KPI can be compared between two periods
*   Impressions and conversions thresholds can be modified
*   URL parameters are by default ignored for landing pages analysis, this setting can be switched 

## **Generating the reports**

1. Create a [new Google Sheet](https://sheets.new)
2. In Google Ads go to Tools & Settings → Bulk Actions → Scripts
3. Add a new script
4. Delete all the content in the text editor
5. Paste [the script](https://github.com/google/ads-account-structure-script/blob/master/structurescript.js) into your account
6. Change parameters according to the analysis you want to run:
    *   **SPREADSHEET\_URL** = ‘xyz’
        *   Replace 'xyz' by the url of your Google Sheet (eg. 'https://docs.google.com/spreadsheets/d/abcd/edit#gid=0')
    *   **(optional) PERIOD\_BEGINNING** = 'default'
        *   To run the analysis on a period different than the previous week, replace default with the format 'YYYYMMDD' (eg. '20200131')
    *   **(optional) NUMBER\_OF\_DAYS** = 7
        *   To run the analysis on a period of a different length, change 7 to the desired number of days
    *   **(optional) PERIOD\_COMPARISON\_BEGINNING** = 'disabled'
        *   To compare 2 periods, replace 'disabled' with the start date of the second period with the format 'YYYYMMDD' (eg. '20190131')
    *   **(optional) ACCOUNT\_LIST** = ['disabled']
        *   If the analysis should be done on a subset of accounts in the current MCC, replace ['disabled'] with the list of accounts (eg. ['xxx-xxx-xxxx','yyy-yyy-yyyy','zzz-zzz-zzzz'])
    *   **(optional) IMPRESSION\_THRESHOLD** = 'default'
        *   To change the ad group impression threshold over the selected period used in analysis, change 'default' to the desired value (eg. 5000). The default value is 3000/week and is adjusted automatically to the period selected.
    *   **(optional) CONVERSION\_THRESHOLD** = 'default'
        *   To change the campaign conversion threshold over the selected period used in analysis, change 'default' to the desired value (eg. 30). The default value is 10/week and is adjusted automatically to the period selected.
    *   **(optional) IGNORE\_URL\_PARAMETERS** = true
        *   URL parameters are by default ignored for landing pages analysis, this setting can be switched by replacing true with false



7. Click on Run, give authorizations if prompted
9. Your report is being built on the Google Sheet you provided, it may take up to 30 minutes
10. If you are running the analysis for a MCC with more than 50 accounts, or a single account with more than 100 campaigns, see _Instructions for large accounts_

### **Instructions for large accounts**


Due to Google Ads script timeout limitations, analysis on MCC with more than 50 accounts will require you to run the script again for each subsequent batch of 50 accounts. \
When doing so, change the value of **ACCOUNTS\_ALREADY\_ANALYZED** to the number of accounts already analysed (eg. 50, 100, 150...). This indication will also be displayed in the report. 



Similarly, for analysis on accounts with a large number of campaigns you will need to run the script again where the analysis was paused at the timeout (after 30 minutes). \
When doing so change the value of **CAMPAIGNS\_ALREADY\_ANALYZED** to the number of campaigns already analysed (eg. 100, 200, 300...). This indication will also be displayed in the report. 


## **Details of account structure KPIs in the reports**



#### **Landing pages analysis**



*   \# of unique landing pages
    *   From ad groups in search campaigns with Impressions > 0
    *   Unique landing page criteria detailed below
*   Ratio of standard ad groups per unique landing page
    *   Number of standard ad groups with impressions > 0 in search campaigns

#### **Ad groups analysis**



*  \# of ad groups (standard + DSA)
    *   Number of ad groups with Impressions > 0 in search campaigns
*   % of investment on standard ad groups with a RSA at Ad Strength above "Good"
    *   In search campaigns. Ad Strenght "Good" and "Excellent" are taken into account.
*   % of investment on DSA ad groups
    *   In search campaigns
*   % of standard ad groups >= 3k impressions/week (or the threshold of your choice)
    *   In search campaigns, over total number of standard ad groups with Impressions > 0
*   Average impressions per standard ad group with &lt; 3k impressions/week (or the threshold of your choice)
    *   Average number of impressions among the group of standard ad groups with impressions between 1 and (threshold - 1)


#### **Campaigns analysis**



*   \# of search campaigns
    *   with Impressions > 0
*   \# of experiment search campaigns
    *   Among search campaigns
*  % of investment on conversion-based smartbidding campaigns
    * % of investement on the following bidding strategies in search campaigns:
        * TARGET_CPA
        * TARGET_ROAS
        * MAXIMIZE_CONVERSIONS
        * MAXIMIZE_CONVERSION_VALUE
*   Bidding strategies
    *   Name and % of investement on each bidding strategies in search campaigns
*   \# of campaigns >= 10 conversions/week (or the threshold of your choice)
    *   Among search campaigns
*   % of campaigns >= 10 conversions/week (or the threshold of your choice)
    *   Among search campaigns with Impressions > 0
*   Average conversions on campaigns with &lt; 10 conversions/week (or the threshold of your choice)
    *   Average number of conversions among the group of search campaigns with conversions below the threshold
*   \# of campaigns with IS lost due to budget (account level)
    *   Number of search campaigns with impressions > 0 and impression share lost due to budget > 0%
*   Impression Share lost due to budget (campaign level)
    *   Value displayed on campaign level reporting (when the script is executed on a single account)

#### **Keywords analysis**



*   \# of active keywords
    *   Total number of keywords with status “Enabled”
*   % of active keywords with &lt; 10 impressions
    *   Among keywords with status “Enabled”
