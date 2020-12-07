// Beginning of parameters

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1lICiRmYoc_cai7l3YfGsnhnrYWUvV9any-aQQOtG3_E/edit?resourcekey=0-Pw2iJriK8AUuD-jPsNhrsA#gid=0'; //example 'https://docs.google.com/spreadsheets/d/abcd/edit#gid=0'
var PERIOD_BEGINNING = 'default'; //example '20200101'
var NUMBER_OF_DAYS = 7; //length of the period
var PERIOD_COMPARISON_BEGINNING = 'disabled'; //example '20190101'
var RESUME_AFTER_TIMEOUT = 0;
var ACCOUNT_LIST = ['disabled']; //['xxx-xxx-xxxx','yyy-yyy-yyyy','zzz-zzz-zzzz'] // ['380-382-1780','363-250-0541'] // ['disabled']

// End of parameters

var now = new Date();
var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
var timeZone = 'UTC';
if (PERIOD_BEGINNING == 'default')  {   PERIOD_BEGINNING = new Date(now.getTime() - 14 * MILLIS_PER_DAY); PERIOD_BEGINNING = Utilities.formatDate(PERIOD_BEGINNING, timeZone, 'yyyyMMdd');}
var PERIOD_END = new Date (strtodate(PERIOD_BEGINNING).getTime() + (NUMBER_OF_DAYS - 1) * MILLIS_PER_DAY);
var PERIOD_END = Utilities.formatDate(PERIOD_END, timeZone, 'yyyyMMdd');
var now = new Date();
var PERIOD_COMPARISON_END = '';
if (PERIOD_COMPARISON_BEGINNING != 'disabled') { PERIOD_COMPARISON_END = new Date (strtodate(PERIOD_COMPARISON_BEGINNING).getTime() + (NUMBER_OF_DAYS - 1) * MILLIS_PER_DAY);  PERIOD_COMPARISON_END = Utilities.formatDate(PERIOD_COMPARISON_END, timeZone, 'yyyyMMdd');   }
var periodfromtxt = PERIOD_BEGINNING;
var periodtotxt = PERIOD_END;
var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
var periodformatted2 = PERIOD_COMPARISON_BEGINNING.substring(6, 8)+'/'+PERIOD_COMPARISON_BEGINNING.substring(4, 6)+'/'+PERIOD_COMPARISON_BEGINNING.substring(0, 4)+' to '+PERIOD_COMPARISON_END.substring(6, 8)+'/'+PERIOD_COMPARISON_END.substring(4, 6)+'/'+PERIOD_COMPARISON_END.substring(0, 4);
var periodfromto = periodfromtxt + ',' + periodtotxt;
var impressionsthreshold = parseInt(3*NUMBER_OF_DAYS/7)*1000;
var conversionsthreshold = parseInt(10*NUMBER_OF_DAYS/7);

function strtodate(datestr)
{
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
  var date = new Date(months[parseInt(datestr.substring(4, 6), 10)-1]+' '+parseInt(datestr.substring(6, 8), 10)+', '+datestr.substring(0, 4)+' 12:00:00 +0000');
  return date;
}

function trueurl(s)
{
  var stop_chars = ['?', '{'];
  var short_s = '';
  var l = s.length
  for(var i=0; i < l-1; i++)
    {
    short_s += s[i];
    if(stop_chars.indexOf(s[i+1]) >= 0) {break;}
    if((stop_chars.indexOf(s[i+2]) >= 0) && (s[i+1] == '/')) {break;}
    }
  return short_s; 
}

function remDups(array) 
{
  var outArray = [];
  array.sort();
  outArray.push(array[0]);
  for(var n in array)
    { if(outArray[outArray.length-1]!=array[n]) { outArray.push(array[n]); } }
  return outArray;
}
  
function main()
{
  ScriptyApp.setHeader({customerId:63103371}); // this line is only necessary in AppScript - 63103371 = Lelynx internal MCC ///. 89498466 = le lynx bank
  var IsMCC = false
  try 
  {
    if (ACCOUNT_LIST[0] != 'disabled') 
    {   
    var accountSelector = AdsManagerApp
    .accounts()
    .withCondition('Impressions > 0')
    .forDateRange(periodfromto)
    .orderBy('Cost DESC')
    .withIds([ACCOUNT_LIST]).get()
    if (accountSelector.totalNumEntities() > 1)  {  IsMCC = true }
    }
    else
    {
    var accountSelector = AdsManagerApp
    .accounts()
    .withCondition('Impressions > 0')
    .forDateRange(periodfromto)
    .orderBy('Cost DESC').get()
    if (accountSelector.totalNumEntities() > 1)  {  IsMCC = true }   
    } 
  } catch (e) {} 

  var currentAccount = AdsApp.currentAccount();
  if (ACCOUNT_LIST[0] != 'disabled' && IsMCC == false) { currentAccount = accountSelector.next() };
  var accountName = currentAccount.getName();   accountName = accountName.substring(0, Math.min(30,accountName.length));
  var accountID = currentAccount.getCustomerId();
  
  if (RESUME_AFTER_TIMEOUT == 0)
  {
    var sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Account structure report - Search');
    if (!sheet1) { sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).insertSheet(accountName+ ' ' + accountID + ' - Account structure report - Search'); }
    sheet1.clear();
    sheet1.appendRow([' ']);  
    sheet1.appendRow([' ', 'Account Structure Assessment - '+accountName+ ' ' + accountID]);
    if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet1.appendRow([' ', 'Period analysed: '+periodformatted+' & '+periodformatted2])} 
    else { sheet1.appendRow([' ', 'Period analysed: '+periodformatted])  }
    sheet1.appendRow([' ']); 
    sheet1.appendRow([' ']);  
    sheet1.appendRow([' ']); 
    sheet1.setFrozenRows(7);

    if (IsMCC == true) 
    {
      sheet1.appendRow([' ','Period analysed', 'Account ID', 'Account name', 'Cost on search campaigns', 'Currency', '# of unique landing pages',
    'Ratio of standard ad groups per unique landing page',  '# of ad groups (standard + DSA)', '# of DSA ad groups',
    '# of standard ad groups >= '+impressionsthreshold/1000+'k impressions', '% of standard ad groups >= '+impressionsthreshold/1000+'k impressions', 
    'Average impressions per standard ad group with < '+impressionsthreshold/1000+'k impressions','# of search campaigns', '# of experiment search campaigns - might explain some traffic split',
    '# of campaigns >= '+conversionsthreshold+' conversions', '% of campaigns >= '+conversionsthreshold+' conversions', 'Average conversions on campaigns with < '+conversionsthreshold+' conversions', 
    '# of active keywords', '% of active keywords with < 10 impressions', 'Action plan']);

      sheet1.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a1:z5').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a7:z7').setWrap(true);
      sheet1.getRange('b2:b2').setFontWeight('bold');
      sheet1.getRange('b2:b2').setFontSize(14);
      sheet1.getRange('a1:z7').setFontColor('#666666');
      sheet1.getRange('a6:z7').setVerticalAlignment('middle');
      sheet1.getRange('a6:z7').setHorizontalAlignment('center');
      sheet1.getRange('g:g').setHorizontalAlignment('center');
      sheet1.getRange('h:h').setHorizontalAlignment('center');
      sheet1.setColumnWidth(1, 21);
      sheet1.getRange('b6:f6').merge();
      sheet1.getRange('b6:f6').setValue('Account details');
      sheet1.getRange('b6:f6').setBackground('#4285f4');
      sheet1.getRange('g6:h6').merge();
      sheet1.getRange('g6:h6').setValue('Landing pages');
      sheet1.getRange('g6:h6').setBackground('#ea4335');
      sheet1.getRange('i6:m6').merge();
      sheet1.getRange('i6:m6').setValue('Ad groups');
      sheet1.getRange('i6:m6').setBackground('#fbbc04');
      sheet1.getRange('n6:r6').merge();
      sheet1.getRange('n6:r6').setValue('Campaigns');
      sheet1.getRange('n6:r6').setBackground('#34a853');
      sheet1.getRange('s6:t6').merge();
      sheet1.getRange('s6:t6').setValue('Keywords');
      sheet1.getRange('s6:t6').setBackground('#d5a6bd');
      sheet1.getRange('b6:t6').setFontColor('white');
      sheet1.getRange('u7').setFontWeight('bold');
      sheet1.setColumnWidth(21, 400);
      sheet1.setColumnWidth(4, 170);
      sheet1.setColumnWidth(2, 160);
      sheet1.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
    }
    else 
    {
      var sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Account structure report - Search');
      if (!sheet1) { sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).insertSheet(accountName+ ' ' + accountID + ' - Account structure report - Search'); }
      sheet1.clear();
      sheet1.appendRow([' ']);  
      sheet1.appendRow([' ', 'Account Structure Assessment - '+accountName+ ' ' + accountID]);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet1.appendRow([' ', 'Period analysed: '+periodformatted+' & '+periodformatted2])} 
      else { sheet1.appendRow([' ', 'Period analysed: '+periodformatted])  }
      sheet1.appendRow([' ']); 
      sheet1.appendRow([' ']);  
      sheet1.appendRow([' ']); 
      sheet1.appendRow([' ','Period analysed', 'Account ID', 'Account name','Campaign ID', 'Campaign name', 'Cost on search campaigns', 'Currency', '# of unique landing pages',
        'Ratio of standard ad groups per unique landing page',  '# of ad groups (standard + DSA)', '# of DSA ad groups',
        '# of standard ad groups >= '+impressionsthreshold/1000+'k impressions', '% of standard ad groups >= '+impressionsthreshold/1000+'k impressions', 
        'Average impressions per standard ad group with < '+impressionsthreshold/1000+'k impressions','# of search campaigns', '# of experiment search campaigns - might explain some traffic split',
        '# of campaigns >= '+conversionsthreshold+' conversions', '% of campaigns >= '+conversionsthreshold+' conversions', 
        'Average conversions on campaigns with < '+conversionsthreshold+' conversions', '# of active keywords', '% of active keywords with < 10 impressions', 'Action plan']);
      sheet1.setFrozenRows(7);
      sheet1.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a1:z5').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a7:z7').setWrap(true);
      sheet1.getRange('b2:b2').setFontWeight('bold');
      sheet1.getRange('b2:b2').setFontSize(14);
      sheet1.getRange('a1:z7').setFontColor('#666666');
      sheet1.getRange('a6:z7').setVerticalAlignment('middle');
      sheet1.getRange('a6:z7').setHorizontalAlignment('center');
      sheet1.getRange('i:j').setHorizontalAlignment('center');
      sheet1.getRange('e8:f8').setHorizontalAlignment('center');
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet1.getRange('e9:f9').setHorizontalAlignment('center') }
      sheet1.setColumnWidth(1, 21);
      sheet1.getRange('b6:h6').merge();
      sheet1.getRange('b6:h6').setValue('Account details');
      sheet1.getRange('b6:h6').setBackground('#4285f4');
      sheet1.getRange('i6:j6').merge();
      sheet1.getRange('i6:j6').setValue('Landing pages');
      sheet1.getRange('i6:j6').setBackground('#ea4335');
      sheet1.getRange('k6:o6').merge();
      sheet1.getRange('k6:o6').setValue('Ad groups');
      sheet1.getRange('k6:o6').setBackground('#fbbc04');
      sheet1.getRange('p6:t6').merge();
      sheet1.getRange('p6:t6').setValue('Campaigns');
      sheet1.getRange('p6:t6').setBackground('#34a853');
      sheet1.getRange('u6:v6').merge();
      sheet1.getRange('u6:v6').setValue('Keywords');
      sheet1.getRange('u6:v6').setBackground('#d5a6bd');
      sheet1.getRange('b6:v6').setFontColor('white');
      sheet1.getRange('w7').setFontWeight('bold');
      sheet1.setColumnWidth(23, 400);
      sheet1.setColumnWidth(4, 150);
      sheet1.setColumnWidth(6, 150);
      sheet1.setColumnWidth(2, 160);
      sheet1.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
      
      var sheet2 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Landing page report - Data');
      if (!sheet2) { sheet2 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).insertSheet(accountName+ ' ' + accountID + ' - Landing page report - Data'); }
      sheet2.clear();
      sheet2.appendRow([' ']);  
      sheet2.appendRow([' ', 'Landing page report - Data - '+accountName+ ' ' + accountID]);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet2.appendRow([' ', 'Period analysed: '+periodformatted+' & '+periodformatted2])} 
      else { sheet2.appendRow([' ', 'Period analysed: '+periodformatted])  }
      sheet2.appendRow([' ']); 
      sheet2.appendRow([' ']);  
      sheet2.appendRow([' ']); 
      sheet2.appendRow([' ', 'Landing page', 'Impressions', 'Clicks', 'Conversions', 'Ad group ID', 'Ad group name', 'Campaign ID', 'Campaign name', 'Action plan']);
      sheet2.setColumnWidth(2, 300);
      sheet2.setColumnWidth(7, 150);
      sheet2.setColumnWidth(9, 150);
      sheet2.setFrozenRows(7);
      sheet2.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('a1:z6').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('b6:z6').setBorder(true, true, false, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('a7:z7').setWrap(true);
      sheet2.getRange('b2:b2').setFontWeight('bold');
      sheet2.getRange('b2:b2').setFontSize(14);
      sheet2.getRange('a1:z7').setFontColor('#666666');
      sheet2.getRange('a6:z7').setVerticalAlignment('middle');
      sheet2.getRange('a6:z7').setHorizontalAlignment('center');
      sheet2.setColumnWidth(1, 21);
      sheet2.getRange('j7').setFontWeight('bold');
      sheet2.setColumnWidth(10, 400);
      sheet2.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);

      var sheet3 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Landing page report - Pivot table');
      if (!sheet3) { sheet3 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).insertSheet(accountName+ ' ' + accountID + ' - Landing page report - Pivot table'); }
      sheet3.clear();
      sheet3.appendRow([' ']);  
      sheet3.appendRow([' ', 'Landing page report - Pivot table - '+accountName+ ' ' + accountID]);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet3.appendRow([' ', 'Period analysed: '+periodformatted+' & '+periodformatted2])} 
      else { sheet3.appendRow([' ', 'Period analysed: '+periodformatted])  }
      sheet3.appendRow([' ']); 
      sheet3.appendRow([' ']);  
      sheet3.appendRow([' ']); 
      sheet3.setColumnWidth(6, 110);
      sheet3.setColumnWidth(7, 110);
      sheet3.getRange('b2:b2').setFontWeight('bold');
      sheet3.getRange('b2:b2').setFontSize(14);
      sheet3.getRange('a1:z7').setFontColor('#666666');
      sheet3.getRange('b7:g7').setFontColor('white');
      sheet3.getRange('b7').createPivotTable(sheet2.getRange('b7:j50000'));
      var pivotTable = sheet3.getPivotTables()[0];
      var rowgroup = pivotTable.addRowGroup(2);
      pivotTable.addPivotValue(3, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
      pivotTable.addPivotValue(4, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
      pivotTable.addPivotValue(5, SpreadsheetApp.PivotTableSummarizeFunction.SUM);
      pivotTable.addPivotValue(6, SpreadsheetApp.PivotTableSummarizeFunction.COUNTUNIQUE);
      pivotTable.addPivotValue(8, SpreadsheetApp.PivotTableSummarizeFunction.COUNTUNIQUE);
      rowgroup.showTotals(false)
        .sortDescending()
        .sortBy(pivotTable.getPivotValues()[0], []);
      sheet3.autoResizeColumn(2);
      sheet3.getRange('a1:z1000').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet3.setColumnWidth(1, 21);
      sheet3.getRange('a7:z7').setWrap(true);
      sheet3.getRange('a6:z7').setVerticalAlignment('middle');
      sheet3.getRange('a6:z7').setHorizontalAlignment('center');
      sheet3.getRange('b7:g7').setBackground('#4285f4');
      sheet3.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
    }
  }
  else
  {
  var sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Account structure report - Search');
  var sheet2 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Landing page report - Data');
  var sheet3 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Landing page report - Pivot table');
  }
  if (IsMCC == true) 
  {
    if (RESUME_AFTER_TIMEOUT == 0)
    {
      while (accountSelector.hasNext())
      {
        var account = accountSelector.next();
        accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC);
        if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, account, sheet1, IsMCC) }
      }
    }
    else
    {
      var i = 0;
      while (i < RESUME_AFTER_TIMEOUT)
      {
        var account = accountSelector.next();
        i++;
      }
      while (accountSelector.hasNext())
      {
        var account = accountSelector.next();
        accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC);
        if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, account, sheet1, IsMCC) }
      }
    }
  }
  else
  {
   var campaignIterator = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').forDateRange(periodfromto).orderBy('Cost DESC').get();
   if (RESUME_AFTER_TIMEOUT == 0)
   {
      accountassessment(periodfromtxt, periodtotxt, currentAccount, sheet1, IsMCC);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, currentAccount, sheet1, IsMCC) }
      while (campaignIterator.hasNext())
      {
          var campaign = campaignIterator.next();
          campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1);
          if (PERIOD_COMPARISON_BEGINNING != 'disabled') { campaignassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, campaign, sheet1); }
      }
      try
      {
        lpreport(periodfromtxt, periodtotxt, sheet2);
      } catch (e) {}
    }
    else
    {
      var i = 0;
      while (i < RESUME_AFTER_TIMEOUT)
      {
        var campaign = campaignIterator.next();
        i++;
      }
      while (campaignIterator.hasNext())
      {
          var campaign = campaignIterator.next();
          campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1);
          if (PERIOD_COMPARISON_BEGINNING != 'disabled') { campaignassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, campaign, sheet1); }
      }
      try
      {
        lpreport(periodfromtxt, periodtotxt, sheet2);
      } catch (e) {}
    }
  }
}

function accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC)
{
  var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt;


    AdsManagerApp.select(account);  
    var accountName = account.getName();
    var accountCID = account.getCustomerId();
    var accountcurrency = account.getCurrencyCode();
    var campaignIterator = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').forDateRange(periodfromto).get();
    var searchcampaignsnumber = campaignIterator.totalNumEntities();
    if (searchcampaignsnumber > 0)
      {
       /* 
       var searchcampaignsnumberhigh  = ''; // campaign level
        var  pourcentcampaignhigh  = ''; //  campaign level
        var  searchcampaignstrialnumber  = ''; //  campaign level
        var  adGroupnumber  = ''; //  campaign level
        var  adGroupDSAnumber  = ''; //  campaign level
        var  adGrouphighimpressions  = '';
        var  pourcenthighimpression  = '';
        var  totalkeywords  = '';
        var  lowkeywords  = '';
        var  percentlowkeywords  = '';
        var  totalcostaccount  = '';
        var averageconv  = '';
        var avstdadgroupimp  = '';
        var landingpage  = '';
        var ratiolp  = '';
         */
        

        var campaignSelectorhigh = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Conversions >= '+conversionsthreshold).forDateRange(periodfromto).get();
          var searchcampaignsnumberhigh = campaignSelectorhigh.totalNumEntities();
          var pourcentcampaignhigh = parseInt(searchcampaignsnumberhigh*100 / searchcampaignsnumber)+'%';
        
        var campaigntrialSelector = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').withCondition('CampaignExperimentType = EXPERIMENT').forDateRange(periodfromto).get();
          var searchcampaignstrialnumber = campaigntrialSelector.totalNumEntities();
       
        var adGroupIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType IN [SEARCH_DYNAMIC_ADS, SEARCH_STANDARD]').forDateRange(periodfromto).get();
          var adGroupnumber = adGroupIterator.totalNumEntities();
        var adGroupDSAIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_DYNAMIC_ADS').forDateRange(periodfromto).get();
          var adGroupDSAnumber = adGroupDSAIterator.totalNumEntities();
          var adGroupIterator = AdsApp.adGroups().withCondition('Impressions >= '+impressionsthreshold).withCondition('AdGroupType = SEARCH_STANDARD').forDateRange(periodfromto).get();
          var adGrouphighimpressions = adGroupIterator.totalNumEntities();
        var pourcenthighimpression = '';  
        if  ((adGroupnumber-adGroupDSAnumber) > 0) {pourcenthighimpression = parseInt(adGrouphighimpressions*100 / (adGroupnumber-adGroupDSAnumber))+'%'}
        
        
          var totalkeywords = AdsApp
           .keywords()
.withCondition('Impressions > 0')
           .forDateRange(periodfromto).get();
        var totalkeywords = totalkeywords.totalNumEntities();
        var lowkeywords = AdsApp
           .keywords()
.withCondition('Impressions > 0').withCondition('Impressions < 10')
           .forDateRange(periodfromto).get();
        lowkeywords = lowkeywords.totalNumEntities();
               var percentlowkeywords = '';
        if (totalkeywords > 0) { percentlowkeywords = parseInt(lowkeywords*100/totalkeywords)+'%'  }       
       
        var reportcampaigns = AdsApp.report(
          'SELECT Cost, Conversions ' +
          'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
          'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
          'DURING ' + periodfromto);
        var rows = reportcampaigns.rows();
          var weightedconv = 0;
          var totalcostaccount = 0;
            while (rows.hasNext())
              {
              var row = rows.next();
              var Conversions = parseFloat(row['Conversions'].replace(/,/g,''));
              var Cost = parseFloat(row['Cost'].replace(/,/g,''));
              if (Conversions < conversionsthreshold) { weightedconv += Conversions }
              totalcostaccount += Cost;
              }
          var averageconv = '';
          if ((searchcampaignsnumber - searchcampaignsnumberhigh) > 0)  { averageconv = parseFloat((weightedconv / (searchcampaignsnumber - searchcampaignsnumberhigh)).toFixed(2))  }
          totalcostaccount = parseInt(totalcostaccount);

        var reportadgroup = AdsApp.report(
          'SELECT Impressions, Cost ' +
          'FROM   ADGROUP_PERFORMANCE_REPORT ' +
          'WHERE  AdGroupType = SEARCH_STANDARD AND Impressions > 0 AND Impressions < '+impressionsthreshold+' ' +
          'DURING ' + periodfromto);
          var rows = reportadgroup.rows();
          var totalstdadgroupimp = 0;
            while (rows.hasNext())
              {
              var row = rows.next();
              var Impressions = parseFloat(row['Impressions'].replace(/,/g,''));
              totalstdadgroupimp += Impressions;
              }
          var avstdadgroupimp = '';
          if ((adGroupnumber-adGroupDSAnumber) > 0)  { avstdadgroupimp =  parseInt(totalstdadgroupimp / (adGroupnumber - adGroupDSAnumber - adGrouphighimpressions)) }
    
       var reporturl = AdsApp.report(
         'SELECT ExpandedFinalUrlString ' +
         'FROM   LANDING_PAGE_REPORT ' +
         'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
         'DURING ' + periodfromto);
         var rows = reporturl.rows();
         var landingpage = [];
         var i = 0;
           while (rows.hasNext())
             {
             var row = rows.next();
             landingpage[i] = trueurl(row['ExpandedFinalUrlString']);
              landingpage[i] = landingpage[i].toLowerCase();
             i++;
             }
        landingpage = parseInt(remDups(landingpage).length);
        var ratiolp = parseFloat((adGroupnumber - adGroupDSAnumber) / landingpage).toFixed(1) + ' : 1';

       
        if (IsMCC == true) {
        sheet1.appendRow([' ',periodformatted, accountCID, accountName, totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, adGroupDSAnumber, adGrouphighimpressions ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, searchcampaignsnumberhigh,
 pourcentcampaignhigh, averageconv, totalkeywords, percentlowkeywords]);  
 } 
 else
 {
        sheet1.appendRow([' ',periodformatted, accountCID, accountName, 'All', 'All', totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, adGroupDSAnumber, adGrouphighimpressions ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, searchcampaignsnumberhigh,
 pourcentcampaignhigh, averageconv, totalkeywords, percentlowkeywords]);  
 } 
   
      

   } 
}


function campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1)
{
  var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt; 
    var currentAccount = AdsApp.currentAccount();
     var accountcurrency = currentAccount.getCurrencyCode();
  var searchcampaignsnumber = 1;
       var campaignid = campaign.getId();
            var campaignname = campaign.getName();
           var stats = campaign.getStatsFor(periodfromtxt, periodtotxt);

          var searchcampaignsnumberhigh = 0;
            if (stats.getConversions() >= conversionsthreshold) { searchcampaignsnumberhigh++ }
         
         var pourcentcampaignhigh = parseInt(searchcampaignsnumberhigh*100 / searchcampaignsnumber)+'%';

          var searchcampaignstrialnumber = 0;
           if (campaign.isExperimentCampaign == true) { searchcampaignstrialnumber++ }
       
        var adGroupIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType IN [SEARCH_DYNAMIC_ADS, SEARCH_STANDARD]').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
          var adGroupnumber = adGroupIterator.totalNumEntities();
        var adGroupDSAIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_DYNAMIC_ADS').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
          var adGroupDSAnumber = adGroupDSAIterator.totalNumEntities();
          var adGroupIterator = AdsApp.adGroups().withCondition('Impressions >= '+impressionsthreshold).withCondition('AdGroupType = SEARCH_STANDARD').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
          var adGrouphighimpressions = adGroupIterator.totalNumEntities();
          var pourcenthighimpression = '';
       if ((adGroupnumber-adGroupDSAnumber) > 0)  { pourcenthighimpression = parseInt(adGrouphighimpressions*100 / (adGroupnumber-adGroupDSAnumber))+'%'}
        
        
          var totalkeywords = AdsApp
           .keywords()
.withCondition('Impressions > 0')
          .withCondition('CampaignId = '+campaignid)
           .forDateRange(periodfromto).get();
        var totalkeywords = totalkeywords.totalNumEntities();
        var lowkeywords = AdsApp
           .keywords()
.withCondition('Impressions > 0')
        .withCondition('CampaignId = '+campaignid)
     .withCondition('Impressions < 10')
           .forDateRange(periodfromto).get();
        lowkeywords = lowkeywords.totalNumEntities();
               var percentlowkeywords = '';
        if (totalkeywords > 0) { percentlowkeywords = parseInt(lowkeywords*100/totalkeywords)+'%'  }      
       
        var reportcampaigns = AdsApp.report(
          'SELECT Cost, Conversions ' +
          'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
          'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 AND CampaignId = '+campaignid+' ' +
          'DURING '+periodfromto);
        var rows = reportcampaigns.rows();
          var weightedconv = 0;
          var totalcostaccount = 0;
            while (rows.hasNext())
              {
              var row = rows.next();
              var Conversions = parseFloat(row['Conversions'].replace(/,/g,''));
              var Cost = parseFloat(row['Cost'].replace(/,/g,''));
              if (Conversions < conversionsthreshold) { weightedconv += Conversions }
              totalcostaccount += Cost;
              }
          var averageconv = '';
          if ((searchcampaignsnumber - searchcampaignsnumberhigh) > 0)  { averageconv = parseFloat((weightedconv / (searchcampaignsnumber - searchcampaignsnumberhigh)).toFixed(2))  }
          totalcostaccount = parseInt(totalcostaccount);

        var reportadgroup = AdsApp.report(
          'SELECT Impressions, Cost ' +
          'FROM   ADGROUP_PERFORMANCE_REPORT ' +
          'WHERE  AdGroupType = SEARCH_STANDARD AND Impressions > 0 AND Impressions < '+impressionsthreshold+' AND CampaignId = '+campaignid+' ' +
          'DURING '+periodfromto);
          var rows = reportadgroup.rows();
          var totalstdadgroupimp = 0;
            while (rows.hasNext())
              {
              var row = rows.next();
              var Impressions = parseFloat(row['Impressions'].replace(/,/g,''));
              totalstdadgroupimp += Impressions;
              }
          var avstdadgroupimp = '';
       if ((adGroupnumber - adGroupDSAnumber - adGrouphighimpressions) > 0)  { avstdadgroupimp = parseInt(totalstdadgroupimp / (adGroupnumber - adGroupDSAnumber - adGrouphighimpressions)) }
    
       var reporturl = AdsApp.report(
         'SELECT ExpandedFinalUrlString ' +
         'FROM   LANDING_PAGE_REPORT ' +
         'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 AND CampaignId = '+campaignid+' ' +
         'DURING '+periodfromto);
         var rows = reporturl.rows();
         var landingpage = [];
         var i = 0;
           while (rows.hasNext())
             {
             var row = rows.next();
             landingpage[i] = trueurl(row['ExpandedFinalUrlString']);
              landingpage[i] = landingpage[i].toLowerCase();
             i++;
             }
        landingpage = remDups(landingpage);

  var landingpage = landingpage.filter(function (el) {
  return el != null;
});

        landingpage = parseInt(landingpage.length);
  var ratiolp = '';
        if (landingpage > 0) { ratiolp = parseFloat((adGroupnumber - adGroupDSAnumber) / landingpage).toFixed(1) + ' : 1' }
           
                   sheet1.appendRow([' ',periodformatted, ' ', ' ',campaignid, campaignname, totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, adGroupDSAnumber, adGrouphighimpressions ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, searchcampaignsnumberhigh,
 pourcentcampaignhigh, averageconv, totalkeywords, percentlowkeywords]); 
  
}


function lpreport(periodfromtxt, periodtotxt, sheet2)
{
  
    var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt;
 var reporturl = AdsApp.report(
         'SELECT ExpandedFinalUrlString, AdGroupId, AdGroupName, CampaignId, CampaignName, Clicks, Conversions, Impressions ' +
         'FROM   LANDING_PAGE_REPORT ' +
         'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
         'DURING '+periodfromto);
         var rows = reporturl.rows();
         var landingpage = [];
         var i = 0;
           while (rows.hasNext())
             {
             var row = rows.next();
             landingpage[i] = trueurl(row['ExpandedFinalUrlString']);
               landingpage[i] = landingpage[i].toLowerCase();
               var Impressionslp = parseFloat(row['Impressions'].replace(/,/g,''));
               var Clickslp = parseFloat(row['Clicks'].replace(/,/g,''));
               var Conversionslp = parseFloat(row['Conversions'].replace(/,/g,''));
               var AdGroupIdlp = row['AdGroupId'];
               var AdGroupName = row['AdGroupName'];
               var CampaignId = row['CampaignId'];
               var CampaignName = row['CampaignName'];
             sheet2.appendRow([' ',landingpage[i], Impressionslp, Clickslp, Conversionslp, AdGroupIdlp, AdGroupName, CampaignId, CampaignName ]); 
             i++;
             }
}