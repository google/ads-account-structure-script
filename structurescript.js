// Copyright 2020 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Include the spreadsheet where you want to have the output and the assessment
// periods
var SPREADSHEET_URL = 'xyz';  // example 'https://docs.google.com/spreadsheets/d/abcd/edit#gid=0'
var PERIOD_BEGINNING = 'yyyyMMdd';   // example '20200101'
var PERIOD2_BEGINNING = 'yyyyMMdd';  // example '20190101'
var NUMBER_OF_DAYS = 7;              // length of the period
var CET = ' 12:00:00 +0200';
var now = new Date();
var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
var timeZone = AdsApp.currentAccount().getTimeZone();
var PERIOD_END = new Date(
    strtodate(PERIOD_BEGINNING).getTime() +
    (NUMBER_OF_DAYS - 1) * MILLIS_PER_DAY);
var PERIOD_END = Utilities.formatDate(PERIOD_END, timeZone, 'yyyyMMdd');
var PERIOD2_END = '';

if (PERIOD2_BEGINNING) {
  PERIOD2_END = new Date(
      strtodate(PERIOD2_BEGINNING).getTime() +
      (NUMBER_OF_DAYS - 1) * MILLIS_PER_DAY);
  PERIOD2_END = Utilities.formatDate(PERIOD2_END, timeZone, 'yyyyMMdd');
}
var periodfromtxt = PERIOD_BEGINNING;
var periodtotxt = PERIOD_END;
var periodformatted = periodfromtxt.substring(6, 8) + '/' +
    periodfromtxt.substring(4, 6) + '/' + periodfromtxt.substring(0, 4) +
    ' to ' + periodtotxt.substring(6, 8) + '/' + periodtotxt.substring(4, 6) +
    '/' + periodtotxt.substring(0, 4);
var periodformatted2 = PERIOD2_BEGINNING.substring(6, 8) + '/' +
    PERIOD2_BEGINNING.substring(4, 6) + '/' +
    PERIOD2_BEGINNING.substring(0, 4) + ' to ' + PERIOD2_END.substring(6, 8) +
    '/' + PERIOD2_END.substring(4, 6) + '/' + PERIOD2_END.substring(0, 4);
var periodFromTo = periodfromtxt + ',' + periodtotxt;
var impressionsthreshold = parseInt(3 * NUMBER_OF_DAYS / 7) * 1000;
var conversionsthreshold = parseInt(10 * NUMBER_OF_DAYS / 7);


// Helper Functions
function strtodate(datestr) {
  var months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  var date = new Date(
      months[parseInt(datestr.substring(4, 6), 10) - 1] + ' ' +
      parseInt(datestr.substring(6, 8), 10) + ', ' + datestr.substring(0, 4) +
      CET);
  return date;
}

function remDups(array) {
  var outArray = [];
  array.sort();
  outArray.push(array[0]);
  for (var n in array) {
    if (outArray[outArray.length - 1] != array[n]) {
      outArray.push(array[n]);
    }
  }
  return outArray;
}

function trueUrl(s) {
  var stop_chars = ['?', '{'];
  var short_s = '';
  var l = s.length
  for (var i = 0; i < l - 1; i++) {
    short_s += s[i];
    if (stop_chars.indexOf(s[i + 1]) >= 0) {
      break;
    }
    if ((stop_chars.indexOf(s[i + 2]) >= 0) && (s[i + 1] == '/')) {
      break;
    }
  }
  return short_s;
}



function accountassessment(
    periodfromtxt, periodtotxt, account, mccCID, mccName, sheet1) {
  var periodFromTo = periodfromtxt + ',' + periodtotxt;


  AdsManagerApp.select(account);
  var accountName = account.getName();
  var accountCID = account.getCustomerId();

  var accountcurrency = account.getCurrencyCode();
  var searchCampaigns =
      AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH');
  var campaignIterator = searchCampaigns.withCondition('Impressions > 0')
                             .forDateRange(periodFromTo)
                             .get();
  var searchcampaignsnumber = campaignIterator.totalNumEntities();
  if (searchcampaignsnumber > 0) {
    var adGroupsWithImpressions =
        AdsApp.adGroups().withCondition('Impressions > 0');
    var adGroupsAboveTreshold = AdsApp.adGroups().withCondition(
        'Impressions >= ' + impressionsthreshold)
    var adGroupIterator =
        adGroupsWithImpressions
            .withCondition(
                'AdGroupType IN [SEARCH_DYNAMIC_ADS, SEARCH_STANDARD]')
            .forDateRange(periodFromTo)
            .get();
    var adGroupnumber = adGroupIterator.totalNumEntities();
    var adGroupDSAIterator =
        adGroupsWithImpressions
            .withCondition('AdGroupType = SEARCH_DYNAMIC_ADS')
            .forDateRange(periodFromTo)
            .get();
    var adGroupDSAnumber = adGroupDSAIterator.totalNumEntities();
    var adGroupIterator =
        adGroupsAboveTreshold.withCondition('AdGroupType = SEARCH_STANDARD')
            .forDateRange(periodFromTo)
            .get();
    var adGrouphighimpressions = adGroupIterator.totalNumEntities();
    var percentHighImpressions = '';

    if ((adGroupnumber - adGroupDSAnumber) > 0) {
      percentHighImpressions = parseInt(
                                   adGrouphighimpressions * 100 /
                                   (adGroupnumber - adGroupDSAnumber)) +
          '%'
    }


    var totalKeywords = AdsApp.keywords()
                            .withCondition('Impressions > 0')
                            .forDateRange(periodFromTo)
                            .get();
    var totalKeywords = totalKeywords.totalNumEntities();
    var lowKeywords = AdsApp.keywords()
                          .withCondition('Impressions > 0')
                          .withCondition('Impressions < 10')
                          .forDateRange(periodFromTo)
                          .get();
    lowKeywords = lowKeywords.totalNumEntities();
    var percentlowKeywords = '';

    if (totalKeywords > 0) {
      percentlowKeywords = parseInt(lowKeywords * 100 / totalKeywords) + '%';
    }

    var reportcampaigns = AdsApp.report(
        'SELECT Cost, Conversions ' +
        'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
        'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
        'DURING ' + periodFromTo);

    var rows = reportcampaigns.rows();
    var weightedConv = 0;
    var totalCostAccount = 0;
    while (rows.hasNext()) {
      var row = rows.next();
      var Conversions = parseFloat(row['Conversions'].replace(/,/g, ''));
      var Cost = parseFloat(row['Cost'].replace(/,/g, ''));
      if (Conversions < conversionsthreshold) {
        weightedConv += Conversions;
      }
      totalCostAccount += Cost;
    }
    var averageConv = '';
    if ((searchcampaignsnumber - searchcampaignsnumberhigh) > 0) {
      averageConv = parseFloat(
          (weightedConv / (searchcampaignsnumber - searchcampaignsnumberhigh))
              .toFixed(2));
    }
    totalCostAccount = parseInt(totalCostAccount);

    // Can this all be done in sql?
    var reportAdGroup = AdsApp.report(
        'SELECT Impressions, Cost ' +
        'FROM   ADGROUP_PERFORMANCE_REPORT ' +
        'WHERE  AdGroupType = SEARCH_STANDARD AND Impressions > 0 AND Impressions < ' +
        impressionsthreshold + ' ' +
        'DURING ' + periodFromTo);
    var rows = reportAdGroup.rows();
    var totalStdAdgroupImp = 0;
    while (rows.hasNext()) {
      var row = rows.next();
      var Impressions = parseFloat(row['Impressions'].replace(/,/g, ''));
      totalStdAdgroupImp += Impressions;
    }
    var avStdAdGroupImp = '';
    if ((adGroupnumber - adGroupDSAnumber) > 0) {
      avStdAdGroupImp = parseInt(
          totalStdAdgroupImp /
          (adGroupnumber - adGroupDSAnumber - adGrouphighimpressions));
    }

    var reportUrl = AdsApp.report(
        'SELECT ExpandedFinalUrlString ' +
        'FROM   LANDING_PAGE_REPORT ' +
        'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
        'DURING ' + periodFromTo);
    var rows = reportUrl.rows();
    var landingpage = [];
    var i = 0;
    while (rows.hasNext()) {
      var row = rows.next();
      landingpage[i] = trueurl(row['ExpandedFinalUrlString']);
      landingpage[i] = landingpage[i].toLowerCase();
      i++;
    }
    landingpage = parseInt(remDups(landingpage).length);
    var ratioLp = parseFloat((adGroupnumber - adGroupDSAnumber) / landingpage)
                      .toFixed(1) +
        ' : 1';

    sheet1.appendRow([
      ' ',
      periodformatted,
      accountCID,
      accountName,
      totalCostAccount,
      accountcurrency,
      landingpage,
      ratioLp,
      adGroupnumber,
      adGroupDSAnumber,
      adGrouphighimpressions,
      percentHighImpressions,
      avStdAdGroupImp,
      searchcampaignsnumber,
      searchcampaignstrialnumber,
      searchcampaignsnumberhigh,
      percentcampaignhigh,
      averageConv,
      totalKeywords,
      percentlowKeywords
    ]);
  }
}


function main() {
  var mccAccount = AdsApp.currentAccount();
  var mccName = mccAccount.getName();
  mccName = mccName.substring(0, Math.min(30, mccName.length));
  var mccCID = mccAccount.getCustomerId();


  var sheet1 =
      SpreadsheetApp.openByUrl(SPREADSHEET_URL)
          .getSheetByName(
              mccName + ' ' + mccCID + ' - Account structure report - Search');
  if (!sheet1) {
    sheet1 = SpreadsheetApp.openByUrl(SPREADSHEET_URL)
                 .insertSheet(
                     mccName + ' ' + mccCID +
                     ' - Account structure report - Search');
  }
  sheet1.clear();
  sheet1.appendRow([' ']);
  sheet1.appendRow(
      [' ', 'Account Structure Assessment - ' + mccName + ' ' + mccCID]);
  if (PERIOD2_BEGINNING) {
    sheet1.appendRow(
        [' ', 'Period analysed: ' + periodformatted + ' & ' + periodformatted2]);
  } else {
    sheet1.appendRow([' ', 'Period analysed: ' + periodformatted]);
  }
  sheet1.appendRow([' ']);
  sheet1.appendRow([' ']);
  sheet1.appendRow([' ']);
  sheet1.appendRow([
    ' ',
    'Period analysed',
    'Account ID',
    'Account name',
    'Cost on search campaigns',
    'Currency',
    '# of unique landing pages',
    'Ratio of standard ad groups per unique landing page',
    '# of ad groups (standard + DSA)',
    '# of DSA ad groups',
    '# of standard ad groups >= ' + impressionsthreshold / 1000 +
        'k impressions',
    '% of standard ad groups >= ' + impressionsthreshold / 1000 +
        'k impressions',
    'Average impressions per standard ad group with < ' +
        impressionsthreshold / 1000 + 'k impressions',
    '# of search campaigns',
    '# of experiment search campaigns - might explain some traffic split',
    '# of campaigns >= ' + conversionsthreshold + ' conversions',
    '% of campaigns >= ' + conversionsthreshold + ' conversions',
    'Average conversions on campaigns with < ' + conversionsthreshold +
        ' conversions',
    '# of active keywords',
    '% of active keywords with < 10 impressions',
    'Action plan'
  ]);

  sheet1.setFrozenRows(7);
  sheet1.getRange('a:a').setBorder(
      true, true, true, null, true, true, 'white',
      SpreadsheetApp.BorderStyle.SOLID);
  sheet1.getRange('a1:z5').setBorder(
      true, true, true, true, true, true, 'white',
      SpreadsheetApp.BorderStyle.SOLID);
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
  sheet1.getRange('b3').setBorder(
      null, null, true, null, null, null, '#4285f4',
      SpreadsheetApp.BorderStyle.SOLID_THICK);
  sheet1.getRange('c3').setBorder(
      null, null, true, null, null, null, '#ea4335',
      SpreadsheetApp.BorderStyle.SOLID_THICK);
  sheet1.getRange('d3').setBorder(
      null, null, true, null, null, null, '#fbbc04',
      SpreadsheetApp.BorderStyle.SOLID_THICK);
  sheet1.getRange('e3').setBorder(
      null, null, true, null, null, null, '#34a853',
      SpreadsheetApp.BorderStyle.SOLID_THICK);


  var accountSelector = AdsManagerApp.accounts()
                            .withCondition('Impressions > 0')
                            .forDateRange(periodFromTo)
                            .orderBy('Cost DESC');

  var accountIterator = accountSelector.get();
  while (accountIterator.hasNext()) {
    var account = accountIterator.next();
    accountassessment(
        periodfromtxt, periodtotxt, account, mccCID, mccName, sheet1);
    if (PERIOD2_BEGINNING) {
      accountassessment(
          PERIOD2_BEGINNING, PERIOD2_END, account, mccCID, mccName, sheet1);
    }
  }
}
