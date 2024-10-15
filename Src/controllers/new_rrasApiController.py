from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
import json

isgsRrasApiController = Blueprint('isgsRrasApiController', __name__, template_folder='templates')

appconfig= getAppConfig()
apiUsername = appconfig['newWbesApiUser']
apiPass = appconfig['newWbesApiPass']
apiKey = appconfig['apikey']
rrasApiUrl = "https://gateway.grid-india.in/POSOCO/reports/1.0/WebAccessApi/GetUtilityExternalSharedData"
params = {"apikey": apiKey}
headers = {"Content-Type": "application/json"}
auth = (apiUsername,apiPass)
isgsGenList= appconfig['newWbesIsgsGenList']

@isgsRrasApiController.route('/api/getIsgsRras/<targetDate>')
def isgsRrasIndex(targetDate:str):
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
  
    body = {"Date":targetDateStr,"SchdRevNo": -1,"UserName":apiUsername, "UtilAcronymList": isgsGenList,"UtilRegionIdList":[2]} 
    try:
        resp = requests.post( rrasApiUrl, params=params, auth=auth, data=json.dumps(body), headers=headers)
        if not resp.status_code == 200:
            print(resp.status_code)
            print(f"unable to get data from wbes api")
        respJson = resp.json()
    except Exception as err:
            print(f'Error while making API call is {err}')
    isgsGenDataList = respJson['ResponseBody']["GroupWiseDataList"]
    genRespObj = {}

    for isgsGenData in isgsGenDataList: 
        isgsGenName= isgsGenData['Acronym']
        netSchdDataList = isgsGenData["NetScheduleSummary"]['NetSchdDataList']
        isgsGenRrasData=[]
        for singleSdlData in netSchdDataList:
            # multiple object with 'AS', adding all 
            if singleSdlData['EnergyScheduleTypeName']== 'AS':
                singleFieldRrasData= singleSdlData['NetSchdAmount']
                if len(isgsGenRrasData ) ==0:
                    isgsGenRrasData = singleFieldRrasData
                else:
                    isgsGenRrasData   = [a + b for a, b in zip(isgsGenRrasData ,  singleFieldRrasData)]
        if (len(isgsGenRrasData)== 0) :
            genRespObj[isgsGenName]=[]
        else:
            genDataList = []
            blkNo=1
            for rrasVal in isgsGenRrasData:
                genDataList.append({'blkNo':blkNo, 'val':-1*float(rrasVal)})
                blkNo= blkNo+1
            genRespObj[isgsGenName] = genDataList
        
    return jsonify(genRespObj)


    
    