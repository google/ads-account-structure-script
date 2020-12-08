/**
 * Copyright 2020 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Script and readme on https://github.com/google/ads-account-structure-script

// Beginning of parameters

var SPREADSHEET_URL = 'xyz'; //example 'https://docs.google.com/spreadsheets/d/abcd/edit#gid=0'
var PERIOD_BEGINNING = 'default'; //(optional) format 'yyyymmdd' example '20200131'
var NUMBER_OF_DAYS = 7; //(optional) length of the period analysed in days
var PERIOD_COMPARISON_BEGINNING = 'disabled'; //(optional) format 'yyyymmdd' example '20190131'
var ACCOUNTS_ALREADY_ANALYZED = 0; // (optional)
var CAMPAIGNS_ALREADY_ANALYZED = 0; // (optional)
var ACCOUNT_LIST = ['disabled']; //(optional) format ['xxx-xxx-xxxx','yyy-yyy-yyyy','zzz-zzz-zzzz'] example ['380-382-1780','363-250-0541']
var IMPRESSION_THRESHOLD = 'default'; // (optional)
var CONVERSION_THRESHOLD = 'default'; // (optional)
var IGNORE_URL_PARAMETERS = true; // (optional)

// End of parameters

var now = new Date();
var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
var timeZone = 'UTC';
if (PERIOD_BEGINNING == 'default')  {   PERIOD_BEGINNING = new Date(now.getTime() - (7 + NUMBER_OF_DAYS) * MILLIS_PER_DAY); PERIOD_BEGINNING = Utilities.formatDate(PERIOD_BEGINNING, timeZone, 'yyyyMMdd');}
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
if (IMPRESSION_THRESHOLD == 'default')  { IMPRESSION_THRESHOLD = parseInt(3*NUMBER_OF_DAYS/7)*1000; } else {
  IMPRESSION_THRESHOLD = parseInt(IMPRESSION_THRESHOLD);
}
if (CONVERSION_THRESHOLD == 'default')  { CONVERSION_THRESHOLD = parseInt(10*NUMBER_OF_DAYS/7); } else {
  CONVERSION_THRESHOLD = parseInt(CONVERSION_THRESHOLD);
}
var analysedelements = Math.max(ACCOUNTS_ALREADY_ANALYZED, CAMPAIGNS_ALREADY_ANALYZED);

function strtodate(datestr)
{
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
  var date = new Date(months[parseInt(datestr.substring(4, 6), 10)-1]+' '+parseInt(datestr.substring(6, 8), 10)+', '+datestr.substring(0, 4)+' 12:00:00 +0000');
  return date;
}

function trueurl(s, IGNORE_URL_PARAMETERS)
{
  var stop_chars = [];
  if (IGNORE_URL_PARAMETERS == true) { stop_chars = ['?', '{']; }
  var short_s = '';
  var l = s.length
  for(var i=0; i < l-1; i++)
    {
    if ( i == 0 && String(s[0]+s[1]+s[2]+s[3]+s[4]+s[5]+s[6]+s[7]) == 'https://' ) { i = 8 } else { if ( i == 0 && String(s[0]+s[1]+s[2]+s[3]+s[4]+s[5]+s[6]) == 'http://' ) { i = 7 } }
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

function statusbox(totalelements, analysedelements, IsMCC, sheet1, ELEMENTS_ALREADY_ANALYSED)
{
  if(IsMCC)
  {
    if(analysedelements < totalelements && analysedelements < (ELEMENTS_ALREADY_ANALYSED + 50) )
    {
      if(totalelements > 50 )
      {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: "&COUNTIF(B9:B, B9)&" of '+Math.min((ELEMENTS_ALREADY_ANALYSED + 50), totalelements)+' accounts analysed during this run, on a total of '+totalelements+' eligible accounts"&char(10)&"If timeout after 30 minutes, run the script again with parameter ACCOUNTS_ALREADY_ANALYZED = "&COUNTIF(B9:B, B9)')
      .build();
      sheet1.getRange('b5').setBackground("#fff2cc");
      }
      else
      {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: "&COUNTIF(B9:B, B9)&" of '+totalelements+' eligible accounts analysed"&char(10)&"If timeout after 30 minutes, run the script again with parameter ACCOUNTS_ALREADY_ANALYZED = "&COUNTIF(B9:B, B9)')
      .build();
      sheet1.getRange('b5').setBackground("#fff2cc");
      }
    }
    if(analysedelements == (ELEMENTS_ALREADY_ANALYSED + 50) )
    {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: "&COUNTIF(B9:B, B9)&" of '+(ELEMENTS_ALREADY_ANALYSED + 50)+' accounts analysed during this run, on a total of '+totalelements+' eligible accounts"&char(10)&"Batch of 50 accounts completed, to analyse more acounts run the script again with parameter ACCOUNTS_ALREADY_ANALYZED = "&COUNTIF(B9:B, B9)')
      .build();
      sheet1.getRange('b5').setBackground("#d9ead3");
    }
    if(analysedelements == totalelements)
    {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: Complete. '+analysedelements+' of '+totalelements+' eligible accounts analysed"')
      .build();
      sheet1.getRange('b5').setBackground("#d9ead3");
    }
  }
  else
  {
    if(analysedelements < totalelements)
    {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: "&COUNTIF(B10:B, B9)&" of '+totalelements+' eligible campaigns analysed"&char(10)&"If timeout after 30 minutes, run the script again with parameter CAMPAIGNS_ALREADY_ANALYZED = "&COUNTIF(B10:B, B9)')
      .build();
      sheet1.getRange('b5').setBackground("#fff2cc");
    }
    else
    {
      var richText = SpreadsheetApp.newRichTextValue()
      .setText('="Script execution status: Complete. '+analysedelements+' of '+totalelements+' eligible campaigns analysed"')
      .build();
      sheet1.getRange('b5').setBackground("#d9ead3");
    }
  }
  sheet1.getRange('b5').setRichTextValue(richText);
 }

function main()
{
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

  if (ACCOUNTS_ALREADY_ANALYZED == 0 || CAMPAIGNS_ALREADY_ANALYZED == 0)
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
'Ratio of standard ad groups per unique landing page',  '# of standard ad groups', '% of investment on standard ad groups with a RSA at Ad Strength above "Good"', '% of investment on DSA ad groups', '% of standard ad groups >= '+IMPRESSION_THRESHOLD/1000+'k impressions', 'Average impressions per standard ad group with < '+IMPRESSION_THRESHOLD/1000+'k impressions','# of search campaigns', '# of experiment search campaigns - to explain some traffic split', '% of investment on conversion-based smartbidding campaigns','Bidding strategies', '% of campaigns >= '+CONVERSION_THRESHOLD+' conversions', 'Average conversions on campaigns with < '+CONVERSION_THRESHOLD+' conversions', '# of campaigns with IS lost due to budget (account level)', '# of active keywords', '% of active keywords with < 10 impressions', 'Action plan']);

      sheet1.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a1:z5').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('x6:z6').setBorder(null, null, null, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('w6').setBorder(null, null, null, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
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
      sheet1.getRange('n6:t6').merge();
      sheet1.getRange('n6:t6').setValue('Campaigns');
      sheet1.getRange('n6:t6').setBackground('#34a853');
      sheet1.getRange('u6:v6').merge();
      sheet1.getRange('u6:v6').setValue('Keywords');
      sheet1.getRange('u6:v6').setBackground('#d5a6bd');
      sheet1.getRange('b6:v6').setFontColor('white');
      sheet1.getRange('w7').setFontWeight('bold');
      sheet1.setColumnWidth(23, 400);
      sheet1.setColumnWidth(4, 170);
      sheet1.setColumnWidth(2, 160);
      sheet1.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('x:x').setBorder(true, null, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.setColumnWidth(24, 21);
      try { sheet1.deleteColumns(25, sheet1.getMaxColumns()-24); } catch (e) {}
      sheet1.insertRowsBefore(5, 1);
      sheet1.getRange('b5:e5').merge();
      sheet1.getRange('b5').setFontSize(8);
      sheet1.getRange('b5').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('b5').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
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
'Ratio of standard ad groups per unique landing page',  '# of standard ad groups', '% of investment on standard ad groups with a RSA at Ad Strength above "Good"', '% of investment on DSA ad groups', '% of standard ad groups >= '+IMPRESSION_THRESHOLD/1000+'k impressions', 'Average impressions per standard ad group with < '+IMPRESSION_THRESHOLD/1000+'k impressions','# of search campaigns', '# of experiment search campaigns - to explain some traffic split', '% of investment on conversion-based smartbidding campaigns','Bidding strategies', '% of campaigns >= '+CONVERSION_THRESHOLD+' conversions', 'Average conversions on campaigns with < '+CONVERSION_THRESHOLD+' conversions', '# of campaigns with IS lost due to budget (account level)', 'Impression Share lost due to budget (campaign level)', '# of active keywords', '% of active keywords with < 10 impressions', 'Action plan']);
      sheet1.setFrozenRows(7);
      sheet1.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('a1:z5').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('z6').setBorder(null, null, null, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
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
      sheet1.getRange('p6:w6').merge();
      sheet1.getRange('p6:w6').setValue('Campaigns');
      sheet1.getRange('p6:w6').setBackground('#34a853');
      sheet1.getRange('x6:y6').merge();
      sheet1.getRange('x6:y6').setValue('Keywords');
      sheet1.getRange('x6:y6').setBackground('#d5a6bd');
      sheet1.getRange('b6:y6').setFontColor('white');
      sheet1.getRange('z7').setFontWeight('bold');
      sheet1.setColumnWidth(26, 400);
      sheet1.setColumnWidth(4, 150);
      sheet1.setColumnWidth(6, 150);
      sheet1.setColumnWidth(2, 160);
      sheet1.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet1.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
      if (  sheet1.getMaxColumns() < 27 ){  sheet1.insertColumnAfter(26); }
      sheet1.setColumnWidth(27, 21);
      sheet1.getRange('aa:aa').setBorder(true, null, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.insertRowsBefore(5, 1);
      sheet1.getRange('b5:e5').merge();
      sheet1.getRange('b5').setFontSize(8);
      sheet1.getRange('b5').setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
      sheet1.getRange('b5').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

      var sheet2 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getSheetByName(accountName+ ' ' + accountID + ' - Landing page report - Data');
      if (!sheet2) { sheet2 = SpreadsheetApp.openByUrl(SPREADSHEET_URL).insertSheet(accountName+ ' ' + accountID + ' - Landing page report - Data'); }
      sheet2.clear();
      try { sheet2.deleteRows(1, sheet2.getMaxRows()-1); } catch (e) {}
      lpreport(periodfromtxt, periodtotxt, sheet2);
      sheet2.insertRowAfter(1);
      sheet2.insertRowAfter(1);
      sheet2.insertRowAfter(1);
      sheet2.insertRowAfter(1);
      sheet2.insertRowAfter(1);
      sheet2.insertRowAfter(1);
      sheet2.insertColumnAfter(1);

      if (IGNORE_URL_PARAMETERS)
      {
            sheet2.getRange('b8').setFormula('=ARRAYFORMULA(IF(RIGHT((substitute(substitute(lower(iferror(LEFT(iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A), FIND("{",iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))-1), iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))), "https://", ""), "http://", "")),1)="/",LEFT((substitute(substitute(lower(iferror(LEFT(iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A), FIND("{",iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))-1), iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))), "https://", ""), "http://", "")),LEN((substitute(substitute(lower(iferror(LEFT(iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A), FIND("{",iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))-1), iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))), "https://", ""), "http://", "")))-1),(substitute(substitute(lower(iferror(LEFT(iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A), FIND("{",iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))-1), iferror(LEFT(iferror(LEFT(A8:A, FIND("/?",A8:A)-1), A8:A), (FIND("?",A8:A)-1)), A8:A))), "https://", ""), "http://", ""))))');
            }
else
{
sheet2.getRange('b8').setFormula('=ARRAYFORMULA(IF(RIGHT((substitute(substitute(lower(A8:A), "https://", ""), "http://", "")),1)="/",LEFT(substitute(substitute(lower(A8:A), "https://", ""), "http://", ""), LEN(substitute(substitute(lower(A8:A), "https://", ""), "http://", ""))-1),(substitute(substitute(lower(A8:A), "https://", ""), "http://", ""))))');
}

      sheet2.getRange('A:A').setFontColor('white');
      sheet2.getRange('A1:I7').setValue('');
      sheet2.getRange('B2').setValue('Landing page report - Data - '+accountName+ ' ' + accountID);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { sheet2.getRange('B3').setValue('Period analysed: '+periodformatted+' & '+periodformatted2)}
      else { sheet2.getRange('B3').setValue('Period analysed: '+periodformatted)  }
      sheet2.getRange('B7:J7').setValues([['Landing page', 'Impressions', 'Clicks', 'Conversions', 'Ad group ID', 'Ad group name', 'Campaign ID', 'Campaign name', 'Action plan']]);
      sheet2.setColumnWidth(2, 300);
      sheet2.setColumnWidth(7, 150);
      sheet2.setColumnWidth(9, 150);
      sheet2.setFrozenRows(7);
      sheet2.getRange('a:a').setBorder(true, true, true, null, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('a1:z6').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('b6:z6').setBorder(true, true, false, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('k:k').setBorder(true, null, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet2.getRange('a7:z7').setWrap(true);
      sheet2.getRange('b2:b2').setFontWeight('bold');
      sheet2.getRange('b2:b2').setFontSize(14);
      sheet2.getRange('a1:z7').setFontColor('#666666');
      sheet2.getRange('a6:z7').setVerticalAlignment('middle');
      sheet2.getRange('a6:z7').setHorizontalAlignment('center');
      sheet2.setColumnWidth(1, 21);
      sheet2.setColumnWidth(11, 21);
      sheet2.getRange('j7').setFontWeight('bold');
      sheet2.setColumnWidth(10, 400);
      sheet2.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet2.getRange('b3').setFontWeight('normal');
      sheet2.getRange('b7:i7').setFontWeight('normal');
      try { sheet2.deleteColumns(12, sheet2.getMaxColumns()-11); } catch (e) {}



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
      sheet3.getRange('b7').createPivotTable(sheet2.getRange('b7:j'));
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
      sheet3.setColumnWidth(2, 800);
      sheet3.getRange('a1:z').setBorder(true, true, true, true, true, true, 'white', SpreadsheetApp.BorderStyle.SOLID);
      sheet3.setColumnWidth(1, 21);
      sheet3.setColumnWidth(8, 21);
      sheet3.getRange('a7:z7').setWrap(true);
      sheet3.getRange('a6:z7').setVerticalAlignment('middle');
      sheet3.getRange('a6:z7').setHorizontalAlignment('center');
      sheet3.getRange('b7:g7').setBackground('#4285f4');
      sheet3.getRange('b3').setBorder(null, null, true, null, null, null, '#4285f4', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('c3').setBorder(null, null, true, null, null, null, '#ea4335', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('d3').setBorder(null, null, true, null, null, null, '#fbbc04', SpreadsheetApp.BorderStyle.SOLID_THICK);
      sheet3.getRange('e3').setBorder(null, null, true, null, null, null, '#34a853', SpreadsheetApp.BorderStyle.SOLID_THICK);
      try { sheet3.deleteColumns(9, sheet3.getMaxColumns()-8); } catch (e) {}
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
    var totalelements = accountSelector.totalNumEntities();
    if (ACCOUNTS_ALREADY_ANALYZED == 0 )
    {
      statusbox(totalelements, analysedelements, true, sheet1, ACCOUNTS_ALREADY_ANALYZED) ;
      while (accountSelector.hasNext() && analysedelements < (ACCOUNTS_ALREADY_ANALYZED + 50))
      {
        var account = accountSelector.next();
        accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC, IGNORE_URL_PARAMETERS);
        if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, account, sheet1, IsMCC, IGNORE_URL_PARAMETERS) }
        if (accountSelector.hasNext() == false) { totalelements = analysedelements }
        statusbox(totalelements, analysedelements, true, sheet1, ACCOUNTS_ALREADY_ANALYZED) ;

        //sheet1.getRange('g3').setValue(analysedelements);
      }
    }
    else
    {
      var i = 0;
      while (i < ACCOUNTS_ALREADY_ANALYZED)
      {
        var account = accountSelector.next();
        i++;
      }
      while (accountSelector.hasNext() && analysedelements < (ACCOUNTS_ALREADY_ANALYZED + 50))
      {
        var account = accountSelector.next();
        accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC, IGNORE_URL_PARAMETERS);
        if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, account, sheet1, IsMCC, IGNORE_URL_PARAMETERS) }
        if (accountSelector.hasNext() == false) { totalelements = analysedelements }
        statusbox(totalelements, analysedelements, true, sheet1, ACCOUNTS_ALREADY_ANALYZED) ;
      }
    }
  }
  else
  {
   var campaignIterator = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').forDateRange(periodfromto).orderBy('Cost DESC').get();
   var totalelements = campaignIterator.totalNumEntities();
   if (CAMPAIGNS_ALREADY_ANALYZED == 0)
   {
      statusbox(totalelements, analysedelements, false, sheet1, 0) ;
      accountassessment(periodfromtxt, periodtotxt, currentAccount, sheet1, IsMCC, IGNORE_URL_PARAMETERS);
      if (PERIOD_COMPARISON_BEGINNING != 'disabled') { accountassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, currentAccount, sheet1, IsMCC, IGNORE_URL_PARAMETERS) }
      while (campaignIterator.hasNext())
      {
          var campaign = campaignIterator.next();
          campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1, IGNORE_URL_PARAMETERS);
          if (PERIOD_COMPARISON_BEGINNING != 'disabled') { campaignassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, campaign, sheet1, IGNORE_URL_PARAMETERS); }
          if (campaignIterator.hasNext() == false) { totalelements = analysedelements }
          statusbox(totalelements, analysedelements, false, sheet1, 0) ;
      }
    }
    else
    {
      var i = 0;
      while (i < CAMPAIGNS_ALREADY_ANALYZED)
      {
        var campaign = campaignIterator.next();
        i++;
      }
      while (campaignIterator.hasNext())
      {
          var campaign = campaignIterator.next();
          campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1, IGNORE_URL_PARAMETERS);
          if (PERIOD_COMPARISON_BEGINNING != 'disabled') { campaignassessment(PERIOD_COMPARISON_BEGINNING, PERIOD_COMPARISON_END, campaign, sheet1, IGNORE_URL_PARAMETERS); }
          if (campaignIterator.hasNext() == false) { totalelements = analysedelements }
          statusbox(totalelements, analysedelements, false, sheet1, 0) ;
      }
    }
  }
}

function accountassessment(periodfromtxt, periodtotxt, account, sheet1, IsMCC, IGNORE_URL_PARAMETERS)
{

  var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt;

      try { AdsManagerApp.select(account); } catch (e) {}
    var accountName = account.getName();
    var accountCID = account.getCustomerId();

    var accountcurrency = account.getCurrencyCode();
    var campaignIteratoraccountassessment = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').forDateRange(periodfromto).get();
    var searchcampaignsnumber = campaignIteratoraccountassessment.totalNumEntities();
    if (searchcampaignsnumber > 0)
      {
        var campaignSelectorhigh = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Conversions >= '+CONVERSION_THRESHOLD).forDateRange(periodfromto).get();
          var searchcampaignsnumberhigh = campaignSelectorhigh.totalNumEntities();
          var pourcentcampaignhigh = parseInt(searchcampaignsnumberhigh*100 / searchcampaignsnumber)+'%';

        var campaigntrialSelector = AdsApp.campaigns().withCondition('AdvertisingChannelType = SEARCH').withCondition('Impressions > 0').withCondition('CampaignExperimentType = EXPERIMENT').forDateRange(periodfromto).get();
          var searchcampaignstrialnumber = campaigntrialSelector.totalNumEntities();

        var adGroupIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_STANDARD').forDateRange(periodfromto).get();
          var adGroupnumber = adGroupIterator.totalNumEntities();
        var adGroupDSAIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_DYNAMIC_ADS').forDateRange(periodfromto).get();
          var adGroupDSAnumber = adGroupDSAIterator.totalNumEntities();
          var adGroupIterator = AdsApp.adGroups().withCondition('Impressions >= '+IMPRESSION_THRESHOLD).withCondition('AdGroupType = SEARCH_STANDARD').forDateRange(periodfromto).get();
          var adGrouphighimpressions = adGroupIterator.totalNumEntities();
       var pourcenthighimpression = '';
        if ((adGroupnumber-adGroupDSAnumber) > 0)  { pourcenthighimpression = parseInt(adGrouphighimpressions*100 / (adGroupnumber-adGroupDSAnumber))+'%'}




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
          'SELECT Cost, Conversions, CampaignId, SearchBudgetLostImpressionShare ' +
          'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
          'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
          'DURING ' + periodfromto);
        var rows = reportcampaigns.rows();
          var weightedconv = 0;
          var totalcostaccount = 0;
          var totalcountISlostbudget = 0;
       var costsmartbidding = 0;
       var costMANUAL_CPC = 0;
      var costTARGET_CPA = 0;
var costMAXIMIZE_CLICKS = 0;
var costTARGET_ROAS = 0;
var costMAXIMIZE_CONVERSIONS = 0;
var costMAXIMIZE_CONVERSION_VALUE = 0;
var costTARGET_IMPRESSION_SHARE = 0;



        var smartbiddingstrategies = '';
            while (rows.hasNext())
              {
              var row = rows.next();
              var Conversions = parseFloat(row['Conversions'].replace(/,/g,''));
              var Cost = parseFloat(row['Cost'].replace(/,/g,''));
              if (Conversions < CONVERSION_THRESHOLD) { weightedconv += Conversions }
              totalcostaccount += Cost;

               campaignIteratoraccountassessment = AdsApp.campaigns().withCondition('CampaignId = '+row['CampaignId']).forDateRange(periodfromto).get();
                while (campaignIteratoraccountassessment.hasNext()) {
                  var campaignIteratoraccountassessmentbidstrat = campaignIteratoraccountassessment.next();
                  campaignbidstrat = campaignIteratoraccountassessmentbidstrat.getBiddingStrategyType();
                  if (campaignbidstrat == 'TARGET_SPEND') { campaignbidstrat = 'MAXIMIZE_CLICKS' }
                }

var ISlostbudget = parseFloat(row['SearchBudgetLostImpressionShare'].replace(/,/g,''));
if (ISlostbudget > 0) { totalcountISlostbudget ++ }
               // Logger.log(campaignbidstrat);
               // Logger.log(row['BiddingStrategyName']);
                if (campaignbidstrat == 'TARGET_SPEND' || campaignbidstrat == 'MAXIMIZE_CLICKS' ) { costMAXIMIZE_CLICKS += Cost; }
                if (campaignbidstrat == 'TARGET_CPA') { costsmartbidding += Cost; costTARGET_CPA += Cost; }
                if (campaignbidstrat == 'TARGET_ROAS') { costsmartbidding += Cost; costTARGET_ROAS += Cost; }
                if (campaignbidstrat == 'MAXIMIZE_CONVERSIONS') { costsmartbidding += Cost; costMAXIMIZE_CONVERSIONS += Cost; }
                if (campaignbidstrat == 'MAXIMIZE_CONVERSION_VALUE') { costsmartbidding += Cost; costMAXIMIZE_CONVERSION_VALUE += Cost; }
                if (campaignbidstrat == 'TARGET_IMPRESSION_SHARE') { costTARGET_IMPRESSION_SHARE += Cost; }
                 if (campaignbidstrat == 'MANUAL_CPC') { costMANUAL_CPC += Cost; }

              }
          var averageconv = '';
          if ((searchcampaignsnumber - searchcampaignsnumberhigh) > 0)  { averageconv = parseFloat((weightedconv / (searchcampaignsnumber - searchcampaignsnumberhigh)).toFixed(1))  }
          totalcostaccount = parseInt(totalcostaccount);
         var sharesmartbidding = '';
         if (totalcostaccount > 0)  { sharesmartbidding = Math.min(parseFloat((costsmartbidding*100 / totalcostaccount).toFixed(1)), 100)+'%'  }
         var shareMAXIMIZE_CLICKS = 0;
         if (totalcostaccount > 0)  { shareMAXIMIZE_CLICKS = parseFloat((costMAXIMIZE_CLICKS*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareTARGET_CPA = 0;
         if (totalcostaccount > 0)  { shareTARGET_CPA = parseFloat((costTARGET_CPA*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareTARGET_ROAS = 0;
         if (totalcostaccount > 0)  { shareTARGET_ROAS = parseFloat((costTARGET_ROAS*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareMAXIMIZE_CONVERSIONS = 0;
         if (totalcostaccount > 0)  { shareMAXIMIZE_CONVERSIONS = parseFloat((costMAXIMIZE_CONVERSIONS*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareMAXIMIZE_CONVERSION_VALUE = 0;
         if (totalcostaccount > 0)  { shareMAXIMIZE_CONVERSION_VALUE = parseFloat((costMAXIMIZE_CONVERSION_VALUE*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareTARGET_IMPRESSION_SHARE = 0;
         if (totalcostaccount > 0)  { shareTARGET_IMPRESSION_SHARE = parseFloat((costTARGET_IMPRESSION_SHARE*100 / totalcostaccount).toFixed(1))+'%'  }
         var shareMANUAL_CPC = 0;
         if (totalcostaccount > 0)  { shareMANUAL_CPC = parseFloat((costMANUAL_CPC*100 / totalcostaccount).toFixed(1))+'%'  }

          smartbiddingstrategies = String(shareTARGET_ROAS+ ' TARGET_ROAS, ' + shareTARGET_CPA+ ' TARGET_CPA, ' + shareMAXIMIZE_CONVERSION_VALUE+ ' MAXIMIZE_CONVERSION_VALUE, '+ shareMAXIMIZE_CONVERSIONS+ ' MAXIMIZE_CONVERSIONS, ' + shareTARGET_IMPRESSION_SHARE+ ' TARGET_IMPRESSION_SHARE, ' + shareMAXIMIZE_CLICKS + ' MAXIMIZE_CLICKS, '+ shareMANUAL_CPC+ ' MANUAL_CPC');



              var reportRSA = AdsApp.report(
          'SELECT AdGroupId, Status, Impressions, AdStrengthInfo ' +
          'FROM   AD_PERFORMANCE_REPORT ' +
          'WHERE  AdType = RESPONSIVE_SEARCH_AD AND AdStrengthInfo IN [GOOD, EXCELLENT] ' +
          'DURING ' + periodfromto);
          var rows = reportRSA.rows();
          var idRSA = [];
            while (rows.hasNext())
              {
              var row = rows.next();
               if(parseFloat(row['Impressions'].replace(/,/g,'')) > 0 ) {idRSA.push(row['AdGroupId'])}
              }




        var reportadgroup = AdsApp.report(
          'SELECT Impressions, Cost, AdGroupId, AdGroupType, Clicks ' +
          'FROM   ADGROUP_PERFORMANCE_REPORT ' +
          'WHERE  AdGroupType IN [SEARCH_STANDARD, SEARCH_DYNAMIC_ADS] AND Impressions > 0 ' +
          'DURING ' + periodfromto);
          var rows = reportadgroup.rows();
          var totalstdadgroupimp = 0;
        var totalcost = 0;
        var DSAcost = 0;
        var RSAcost = 0;
          var idDSA = [];
            while (rows.hasNext())
              {
              var row = rows.next();
              var Impressions = parseFloat(row['Impressions'].replace(/,/g,''));
                if (Impressions < IMPRESSION_THRESHOLD && row['AdGroupType'] == 'Standard')  { totalstdadgroupimp += Impressions }
                if (row['AdGroupType'] == 'Search Dynamic Ads')  { idDSA.push(row['AdGroupId']); DSAcost += parseFloat(row['Cost'].replace(/,/g,''));}
                if (idRSA.indexOf(row['AdGroupId']) >= 0 )  { RSAcost += parseFloat(row['Cost'].replace(/,/g,'')) }
                totalcost += parseFloat(row['Cost'].replace(/,/g,''));
              }
              var avstdadgroupimp = '';
          if ((adGroupnumber-adGroupDSAnumber - adGrouphighimpressions) > 0)  { avstdadgroupimp =  parseInt(totalstdadgroupimp / (adGroupnumber - adGroupDSAnumber - adGrouphighimpressions)) }
        var shareRSAcost = '';
        if (totalcost > 0 )  { shareRSAclicks = parseFloat(RSAcost*100/totalcost).toFixed(1)+'%' }
        var shareDSAccost = '';
        if (totalcost > 0 )  { shareDSAclicks = parseFloat(DSAcost*100/totalcost).toFixed(1)+'%' }

       var reporturl = AdsApp.report(
         'SELECT ExpandedFinalUrlString, AdGroupId ' +
         'FROM   LANDING_PAGE_REPORT ' +
         'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
         'DURING ' + periodfromto);
         var rows = reporturl.rows();
         var landingpage = [];
           while (rows.hasNext())
             {
             var row = rows.next();
             landingpage.push(trueurl(row['ExpandedFinalUrlString'], IGNORE_URL_PARAMETERS).toLowerCase())
             }
         landingpage = remDups(landingpage);

  var landingpage = landingpage.filter(function (el) {
  return el != null;
});
        landingpage = parseInt(landingpage.length);
        var ratiolp = parseFloat(Math.abs(adGroupnumber - adGroupDSAnumber) / landingpage).toFixed(1) + ' : 1';



        if (IsMCC == true) {
        sheet1.appendRow([' ',periodformatted, accountCID, accountName, totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, shareRSAclicks, shareDSAclicks ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, sharesmartbidding, smartbiddingstrategies,
 pourcentcampaignhigh, averageconv, totalcountISlostbudget, totalkeywords, percentlowkeywords]);
        if (periodfromtxt != PERIOD_COMPARISON_BEGINNING) { analysedelements++;  }
 }
 else
 {
        sheet1.appendRow([' ',periodformatted, accountCID, accountName,'All', 'All', totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, shareRSAclicks, shareDSAclicks ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, sharesmartbidding, smartbiddingstrategies,
 pourcentcampaignhigh, averageconv, totalcountISlostbudget,'',  totalkeywords, percentlowkeywords]);
 }



   }
}


function campaignassessment(periodfromtxt, periodtotxt, campaign, sheet1, IGNORE_URL_PARAMETERS)
{
  var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt;
    var currentAccount = AdsApp.currentAccount();
     var accountcurrency = currentAccount.getCurrencyCode();
  var searchcampaignsnumber = 1;
       var campaignid = campaign.getId();
            var campaignname = campaign.getName();
            var bidstrategy = campaign.getBiddingStrategyType();
            var sharesmartbidding = '0%'
              if (bidstrategy == 'TARGET_SPEND') { bidstrategy = 'MAXIMIZE_CLICKS' }
               if (bidstrategy == 'TARGET_ROAS' ||  bidstrategy == 'TARGET_CPA' || bidstrategy == 'MAXIMIZE_CONVERSIONS'  ||  bidstrategy == 'MAXIMIZE_CONVERSION_VALUE') {  sharesmartbidding = '100%' }

           var stats = campaign.getStatsFor(periodfromtxt, periodtotxt);

          var searchcampaignsnumberhigh = 0;
            if (stats.getConversions() >= CONVERSION_THRESHOLD) { searchcampaignsnumberhigh++ }

         var pourcentcampaignhigh = parseInt(searchcampaignsnumberhigh*100 / searchcampaignsnumber)+'%';

          var searchcampaignstrialnumber = 0;
           if (campaign.isExperimentCampaign == true) { searchcampaignstrialnumber++ }

        var adGroupIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_STANDARD').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
          var adGroupnumber = adGroupIterator.totalNumEntities();
        var adGroupDSAIterator = AdsApp.adGroups().withCondition('Impressions > 0').withCondition('AdGroupType = SEARCH_DYNAMIC_ADS').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
          var adGroupDSAnumber = adGroupDSAIterator.totalNumEntities();
          var adGroupIterator = AdsApp.adGroups().withCondition('Impressions >= '+IMPRESSION_THRESHOLD).withCondition('AdGroupType = SEARCH_STANDARD').withCondition('CampaignId = '+campaignid).forDateRange(periodfromto).get();
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
          'SELECT Cost, Conversions, BiddingStrategyType, SearchBudgetLostImpressionShare ' +
          'FROM   CAMPAIGN_PERFORMANCE_REPORT ' +
          'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 AND CampaignId = '+campaignid+' ' +
          'DURING '+periodfromto);
        var rows = reportcampaigns.rows();
          var weightedconv = 0;
          var totalcostaccount = 0;
          var SearchBudgetLostImpressionShare = '0%'
            while (rows.hasNext())
              {
              var row = rows.next();
              var Conversions = parseFloat(row['Conversions'].replace(/,/g,''));
              var Cost = parseFloat(row['Cost'].replace(/,/g,''));
              // SearchBudgetLostImpressionShare = parseInt(row['SearchBudgetLostImpressionShare']*100)+'%';
              SearchBudgetLostImpressionShare = row['SearchBudgetLostImpressionShare'];
              if (Conversions < CONVERSION_THRESHOLD) { weightedconv += Conversions }
              totalcostaccount += Cost;
              }
          var averageconv = '';
          if ((searchcampaignsnumber - searchcampaignsnumberhigh) > 0)  { averageconv = parseFloat((weightedconv / (searchcampaignsnumber - searchcampaignsnumberhigh)).toFixed(2))  }
          totalcostaccount = parseInt(totalcostaccount);


                     var reportRSA = AdsApp.report(
          'SELECT AdGroupId, Status, Impressions, AdStrengthInfo ' +
          'FROM   AD_PERFORMANCE_REPORT ' +
          'WHERE  AdType = RESPONSIVE_SEARCH_AD AND AdStrengthInfo IN [GOOD, EXCELLENT] AND CampaignId = '+campaignid+' ' +
          'DURING ' + periodfromto);
          var rows = reportRSA.rows();
          var idRSA = [];
            while (rows.hasNext())
              {
              var row = rows.next();
               if(parseFloat(row['Impressions'].replace(/,/g,'')) > 0 ) {idRSA.push(row['AdGroupId'])}
              }




        var reportadgroup = AdsApp.report(
          'SELECT Impressions, Cost, AdGroupId, AdGroupType, Clicks ' +
          'FROM   ADGROUP_PERFORMANCE_REPORT ' +
          'WHERE  AdGroupType IN [SEARCH_STANDARD, SEARCH_DYNAMIC_ADS] AND Impressions > 0 AND CampaignId = '+campaignid+' '  +
          'DURING ' + periodfromto);
          var rows = reportadgroup.rows();
          var totalstdadgroupimp = 0;
        var totalcost = 0;
        var DSAcost = 0;
        var RSAcost = 0;
          var idDSA = [];
            while (rows.hasNext())
              {
              var row = rows.next();
              var Impressions = parseFloat(row['Impressions'].replace(/,/g,''));
                if (Impressions < IMPRESSION_THRESHOLD && row['AdGroupType'] == 'Standard')  { totalstdadgroupimp += Impressions }
                if (row['AdGroupType'] == 'Search Dynamic Ads')  { idDSA.push(row['AdGroupId']); DSAcost += parseFloat(row['Cost'].replace(/,/g,''));}
                if (idRSA.indexOf(row['AdGroupId']) >= 0 )  { RSAcost += parseFloat(row['Cost'].replace(/,/g,'')) }
                totalcost += parseFloat(row['Cost'].replace(/,/g,''));
              }
              var avstdadgroupimp = '';
          if ((adGroupnumber-adGroupDSAnumber- adGrouphighimpressions) > 0)  { avstdadgroupimp =  parseInt(totalstdadgroupimp / (adGroupnumber - adGroupDSAnumber - adGrouphighimpressions)) }
        var shareRSAcost = '';
        if (totalcost > 0 )  { shareRSAclicks = parseFloat(RSAcost*100/totalcost).toFixed(1)+'%' }
        var shareDSAccost = '';
        if (totalcost > 0 )  { shareDSAclicks = parseFloat(DSAcost*100/totalcost).toFixed(1)+'%' }

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
             landingpage[i] = trueurl(row['ExpandedFinalUrlString'], IGNORE_URL_PARAMETERS);
              landingpage[i] = landingpage[i].toLowerCase();
             i++;
             }
        landingpage = remDups(landingpage);

  var landingpage = landingpage.filter(function (el) {
  return el != null;
});

        landingpage = parseInt(landingpage.length);
  var ratiolp = '';
        if (landingpage > 0) { ratiolp = parseFloat(Math.abs(adGroupnumber - adGroupDSAnumber) / landingpage).toFixed(1) + ' : 1' }

                   sheet1.appendRow([' ',periodformatted, ' ', ' ',campaignid, campaignname, totalcostaccount, accountcurrency, landingpage, ratiolp, adGroupnumber, shareRSAclicks,shareDSAclicks ,
 pourcenthighimpression, avstdadgroupimp, searchcampaignsnumber, searchcampaignstrialnumber, sharesmartbidding, bidstrategy,
 pourcentcampaignhigh, averageconv, '', SearchBudgetLostImpressionShare, totalkeywords, percentlowkeywords]);
          if (periodfromtxt != PERIOD_COMPARISON_BEGINNING) { analysedelements++;  }
}


function lpreport(periodfromtxt, periodtotxt, sheet2)
{

    var periodformatted = periodfromtxt.substring(6, 8)+'/'+periodfromtxt.substring(4, 6)+'/'+periodfromtxt.substring(0, 4)+' to '+periodtotxt.substring(6, 8)+'/'+periodtotxt.substring(4, 6)+'/'+periodtotxt.substring(0, 4);
  var periodfromto = periodfromtxt + ',' + periodtotxt;
 var reporturl = AdsApp.report(
         'SELECT ExpandedFinalUrlString, Impressions, Clicks, Conversions, AdGroupId, AdGroupName, CampaignId, CampaignName ' +
         'FROM   LANDING_PAGE_REPORT ' +
         'WHERE  AdvertisingChannelType = SEARCH AND Impressions > 0 ' +
         'DURING '+periodfromto);
         reporturl.exportToSheet(sheet2);
}
