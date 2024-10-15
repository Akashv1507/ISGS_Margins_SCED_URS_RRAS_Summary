from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
import json

isgsScedApiController = Blueprint('isgsScedApiController', __name__, template_folder='templates')

appconfig= getAppConfig()
apiUsername = appconfig['newWbesApiUser']
apiPass = appconfig['newWbesApiPass']
apiKey = appconfig['apikey']
scedApiUrl = "https://gateway.grid-india.in/POSOCO/reports/1.0/WebAccessApi/GetUtilityExternalSharedData"
params = {"apikey": apiKey}
headers = {"Content-Type": "application/json"}
auth = (apiUsername,apiPass)
isgsGenList= appconfig['newWbesIsgsGenList']

@isgsScedApiController.route('/api/getIsgsSced/<targetDate>')
def isgsScedIndex(targetDate:str): 
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    body = {"Date":targetDateStr,"SchdRevNo": -1,"UserName":apiUsername, "UtilAcronymList": isgsGenList,"UtilRegionIdList":[2]}   
    try:
        resp = requests.post(scedApiUrl, params=params, auth=auth, data=json.dumps(body), headers=headers)
        if not resp.status_code == 200:
            print(resp.status_code)
            print(f"unable to get data from wbes api")
        respJson = resp.json()
    except Exception as err:
        print(f'Error while making API call is {err}')
    isgsGenListDataList = respJson['ResponseBody']["GroupWiseDataList"]
   
    genRespObj = {}

    for isgsGenData in isgsGenListDataList: 
        isgsGenName= isgsGenData['Acronym']
        netSchdDataList = isgsGenData["NetScheduleSummary"]['NetSchdDataList']
        isgsGenScedData=[]
        for singleSdlData in netSchdDataList:
            # multiple object with 'SCED', adding all 
            if singleSdlData['EnergyScheduleTypeName']== 'SCED':
                singleFieldScedData= singleSdlData['NetSchdAmount']
                if len(isgsGenScedData)==0:
                    isgsGenScedData = singleFieldScedData
                else:
                    isgsGenScedData   = [a + b for a, b in zip(isgsGenScedData ,  singleFieldScedData)]
        if (len(isgsGenScedData)== 0) :
            genRespObj[isgsGenName]=[]
        else:
            genDataList = []
            blkNo=1
            for scedVal in isgsGenScedData:
                genDataList.append({'blkNo':blkNo, 'val':-1*float(scedVal)})
                blkNo= blkNo+1
            genRespObj[isgsGenName] = genDataList
       
    return jsonify(genRespObj)


    
    