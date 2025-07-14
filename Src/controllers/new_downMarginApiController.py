from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
import json

genDownMarginApiController = Blueprint('genDownMarginApiController', __name__, template_folder='templates')

appconfig= getAppConfig()
apiUsername = appconfig['newWbesApiUser']
apiPass = appconfig['newWbesApiPass']
apiKey = appconfig['apikey']
marginApiUrl = "https://gateway.grid-india.in/POSOCO/reports/1.0/WebAccessApi/GetUtilityExternalSharedData"
params = {"apikey": apiKey}
headers = {"Content-Type": "application/json"}
auth = (apiUsername,apiPass)
genList= appconfig['newWbesDownMarginGenList']

@genDownMarginApiController.route('/api/getGenDownMargins/<targetDate>')
def genDownMarginsApi(targetDate:str):
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    body = {"Date":targetDateStr,"SchdRevNo": -1,"UserName":apiUsername, "UtilAcronymList": genList,"UtilRegionIdList":[2]}   
    try:
        resp = requests.post( marginApiUrl, params=params, auth=auth, data=json.dumps(body), headers=headers)
        if not resp.status_code == 200:
            print(resp.status_code)
            print(f"unable to get data from wbes api")
        respJson = resp.json()
    except Exception as err:
            print(f'Error while making API call and err-> {err}')
            exit()
    genListData = respJson['ResponseBody']["GroupWiseDataList"]  
    genRespObj = {}
    for genData in genListData: 
        genName= genData['Acronym']
        genSdlData = genData["NetScheduleSummary"]["TotalNetSchdAmount"]
        genDcDataList = genData["DeclarationList"]
        #it will store dc data of current ISGS generator
        genNormDcData= []
        for singleData in genDcDataList:
            # it will have all nuclear, thermal, hydro and RE.. but values will be present only in respective fuel type of generator
            dcDataList=singleData['DeclarationData']
            fuelDcData=[]
            for key in dcDataList.keys():
                if dcDataList[key]:
                    if key=='ThermalDCJsonData':
                        fuelDcData = dcDataList[key]['SCEDNormativeAmount']
                    elif key== 'GasDCJsonData':
                        fuelDcData = dcDataList[key]['GasDCStationLevelJsonData']['StationSCEDNormativeAmount']

            if len(genNormDcData ) ==0:
                genNormDcData = fuelDcData
            else:
                genNormDcData   = [a + b for a, b in zip(genNormDcData ,  fuelDcData)]
        if (len(genSdlData)== 0) or (len(genNormDcData) == 0):
            genRespObj[genName]=[]
        else:
            genDataList = []
            blkNo=1
            for sdlVal, normDcVal in zip(genSdlData,genNormDcData):
                downMarginVal= (-1*(float(sdlVal))) - float(normDcVal)*.55
                if downMarginVal<0:
                    downMarginVal=0
                genDataList.append({'blkNo':blkNo, 'val':downMarginVal})
                blkNo= blkNo+1
            genRespObj[genName] = genDataList
    
    return jsonify(genRespObj)

#-sced, -scuc, -tras
    
    