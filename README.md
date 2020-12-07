## Google Ads - Account structure script 



## **Context**

Search advertising has changed, in large part thanks to machine-learning. Over the years, Google has incorporated more and more machine-learning into products like Smart Bidding, DSA, RSA, Optimized Ad rotation, DDA, Ad extension selection, Semantic Keywords, etc. 

Thanks to these advancements, granular account structures are no longer necessary. They segment traffic and limit learning data for some machine-learning based solutions, they require unnecessary upkeep and time commitment to manage, and their complexity can lead to operational mistakes. Furthermore, Smart Bidding opens the door for simpler structures by analyzing thousands of signals in real time to define optimal bids for each search query.

Adopting a simpler account structure leads to:



*   Larger volume of learning data at ad group level, crucial to improving performance of components such as RSA. In general, machine learning needs volume as well as variety to learn faster and deliver even better results. 
*   Simpler management (up to 20% of time used to manage an account saved and repurposed on higher-value, strategic tasks)
*   Easier to identify insights, detect patterns and identify opportunities while lowering the margin of error as accounts are streamlined. 

## **Purpose of the account structure script**



In order to help identify your account structure improvement opportunities, this Google Ads script will generate a report in Google Sheets with the following KPI (see details below):


#### Landing pages analysis

*   KPI
    *   \# of unique landing pages
    *   Ratio of standard ad groups per unique landing page
*   Recommendations
    *   For starting ratios above 1 : 1 aim at lowering it 1 : 1 or slightly below
    *   Ratios below 1 : 1 are normal and mean that some landing pages are exclusively covered by DSA ad groups \



#### Ad groups analysis



*   KPI
    *   \# of ad groups - standard + DSA
    *   \# of DSA ad groups
    *   \# of standard ad groups >= 3k impressions/week
    *   % of standard ad groups >= 3k impressions/week 
    *   Average impressions per standard ad group with &lt; 3k impressions 
*   Recommendations
    *   Merge relevant ad groups to maximize the % of standard ad groups >= 3k impressions/week
    *   Ensure semantic coverage is not limited to help average impressions per standard ad group &lt; 3k impressions/week get closer to this value \



#### Campaigns analysis



*   KPI
    *   \# of search campaigns
    *   \# of experiment search campaigns (might explain some traffic split)
    *   \# of search campaigns >= 10 conversions/week	
    *   % of search campaigns >= 10 conversions/week	
    *   Average conversions on campaigns with &lt; 10 conversions/week
*   Recommendations
    *   Increase average conversions by merging campaigns with similar business objective to increase traffic on creatives, generate more training data for algorithms, and have more insightful & less volatile reporting \



#### Keywords analysis



*   KPI
    *   \# of active keywords with Impressions > 0
    *   % of active keywords with &lt; 10 impressions
*   Recommendations
    *   Take advantage of broad match types to lighten keyword portfolio and make maintenance easier

### **Features**

*   Reports can be created at different levels
    *   All accounts in a MCC
    *   A list of accounts in a MCC
    *   A specific account (this level of analysis adds campaign level reporting and a landing page report)
*   Choice of the period for the analysis
    *   Default: previous week
    *   Custom: period of your choice
*   Option to compare with another period

## **Generating the reports**

1. Create a [new Google Sheet](sheets.new)
2. In Google Ads go to Tools & Settings → Bulk Actions → Scripts
3. Add a new script
4. Delete all the content in the text editor
5. Authorize changes
6. Paste [this script](https://github.com/google/ads-account-structure-script/blob/master/structurescript.js) into your account
7. Change parameters according to the analysis you want to run:
    *   **SPREADSHEET\_URL** = ‘xyz’
        *   replace xyz by the url of your Google Sheet, (eg. https://docs.google.com/spreadsheets/d/abcd/edit#gid=0)
    *   **PERIOD\_BEGINNING** = 'default'
        *   If the analysis should be done on a period different than the previous week, replace default with the format YYYYMMDD (eg. 20200131)
    *   **NUMBER\_OF\_DAYS** = 7
        *   If the analysis should be done over a period with a different length, update 7 to the desired number of days
    *   **PERIOD\_COMPARISON\_BEGINNING** = 'disabled'
        *   If the analysis should compare 2 periods, replace disabled with the start date of the second period with the format YYYYMMDD (eg. 20190131)
    *   **ACCOUNT\_LIST **= ['disabled'] 
        *   If the analysis should be done on a subset of accounts in the current MCC, replace ['disabled'] with the list of accounts (eg. ['xxx-xxx-xxxx','yyy-yyy-yyyy','zzz-zzz-zzzz'])
8. Click on Run, authorize changes if prompted
9. Your Google Sheet is being filled automatically on the corresponding tabs
10. If you are running the analysis for a MCC with more than 50 accounts, or a single account with more than 100 campaigns, see _Instructions for large accounts_

### **Instructions for large accounts**


### 
Due to Google Ads script limitations, for analysis on MCC with more than 50 accounts you will need to run the script again for each subsequent batch of 50 accounts. \
When doing so, change the value of **ACCOUNTS\_ALREADY\_ANALYZED** to the number of accounts already analysed (eg. 50, 100, 150...).


### 
Similarly, for analysis on accounts with more than 100 campaigns you will need to run the script again for each subsequent batch of 100 campaigns. \
When doing so change the value of **CAMPAIGNS\_ALREADY\_ANALYZED** to the number of campaigns already analysed (eg. 100, 200, 300...).


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
*   \# of DSA ad groups
    *   Number of DSA ad groups with Impressions > 0 in search campaigns
*   \# of standard ad groups >= 3k impressions/week	
    *   In search campaigns
*   % of standard ad groups >= 3k impressions/week	
    *   In search campaigns, over total number of standard ad groups with Impressions > 0
*   Average impressions per standard ad group with &lt; 3k impressions/week	
    *   Average number of impressions among the group of standard ad groups with  0 &lt; impressions &lt; 3k/week

#### **Campaigns analysis**



*   \# of search campaigns	
    *   with Impressions > 0
*   \# of experiment search campaigns - might explain some traffic split	
    *   Among search campaigns
*   \# of campaigns >= 10 conversions/week	
    *   Among search campaigns
*   % of campaigns >= 10 conversions/week	
    *   Among search campaigns with Impressions > 0
*   Average conversions on campaigns with &lt; 10 conversions/week	
    *   Average number of conversions among the group of search campaigns with  &lt; 10 conversions/week

#### **Keywords analysis**



*   \# of active keywords	
    *   Total number of keywords with status “Enabled”
*   % of active keywords with &lt; 10 impressions
    *   Among keywords with status “Enabled”