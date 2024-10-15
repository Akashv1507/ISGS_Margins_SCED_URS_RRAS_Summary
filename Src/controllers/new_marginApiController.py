from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
import json

isgsMarginApiController = Blueprint('isgsMarginApiController', __name__, template_folder='templates')

appconfig= getAppConfig()
apiUsername = appconfig['newWbesApiUser']
apiPass = appconfig['newWbesApiPass']
apiKey = appconfig['apikey']
marginApiUrl = "https://gateway.grid-india.in/POSOCO/reports/1.0/WebAccessApi/GetUtilityExternalSharedData"
params = {"apikey": apiKey}
headers = {"Content-Type": "application/json"}
auth = (apiUsername,apiPass)
isgsGenList= appconfig['newWbesIsgsGenList']

@isgsMarginApiController.route('/api/getIsgsMargins/<targetDate>')
def isgsMarginsApi(targetDate:str):
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    
    body = {"Date":targetDateStr,"SchdRevNo": -1,"UserName":apiUsername, "UtilAcronymList": isgsGenList,"UtilRegionIdList":[2]}   
    try:
        resp = requests.post( marginApiUrl, params=params, auth=auth, data=json.dumps(body), headers=headers)
        if not resp.status_code == 200:
            print(resp.status_code)
            print(f"unable to get data from wbes api")
        respJson = resp.json()
    except Exception as err:
            print(f'Error while making API call and err-> {err}')
            exit()
    isgsGenListData = respJson['ResponseBody']["GroupWiseDataList"]  
    genRespObj = {}
    for isgsGenData in isgsGenListData: 
        isgsGenName= isgsGenData['Acronym']
        isgsGenSdlData = isgsGenData["NetScheduleSummary"]["TotalNetSchdAmount"]
        isgsGenOnBarDcDataList = isgsGenData["DeclarationList"]
        #it will store dc data of current ISGS generator
        isgsGenOnBarDcData= []
        for singleData in isgsGenOnBarDcDataList:
            # it will have all nuclear, thermal, hydro and RE.. but values will be present only in respective fuel type of generator
            dcDataList=singleData['DeclarationData']
            fuelDcData=[]
            for key in dcDataList.keys():
                if dcDataList[key]:
                    if key=='ThermalDCJsonData':
                        fuelDcData = dcDataList[key]['SellerInpOnbarAmount']
                    elif key == 'HydroDCJsonData':
                        fuelDcData = dcDataList[key]['SellerInpDCAmount']
                    elif key== 'NuclearDCJsonData':
                        fuelDcData = dcDataList[key]['SellerInpDCAmount']
                    elif key== 'GasDCJsonData':
                        fuelDcData = dcDataList[key]['GasDCFuelLevelJsonData']['SellerDCTotalAmount']
                    elif key == 'RenewableDCJsonData':
                        fuelDcData = dcDataList[key]['SellerInpOnbarAmount']

            if len(isgsGenOnBarDcData ) ==0:
                isgsGenOnBarDcData = fuelDcData
            else:
                isgsGenOnBarDcData   = [a + b for a, b in zip(isgsGenOnBarDcData ,  fuelDcData)]
        if (len(isgsGenSdlData)== 0) or (len(isgsGenOnBarDcData) == 0):
            genRespObj[isgsGenName]=[]
        else:
            genDataList = []
            blkNo=1
            for sdlVal, onBarDcVal in zip(isgsGenSdlData,isgsGenOnBarDcData):
                genDataList.append({'blkNo':blkNo, 'val':float(onBarDcVal)- (-1*(float(sdlVal)))})
                blkNo= blkNo+1
            genRespObj[isgsGenName] = genDataList
    
    return jsonify(genRespObj)


    
    