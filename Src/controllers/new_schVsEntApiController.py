from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
from typing import List
import pandas as pd
import json
schVsEntApiController = Blueprint('schVsEntApiController', __name__, template_folder='templates')

appconfig= getAppConfig()
apiUsername = appconfig['newWbesApiUser']
apiPass = appconfig['newWbesApiPass']
apiKey = appconfig['apikey']
newWbesUrl = "https://gateway.grid-india.in/POSOCO/reports/1.0/WebAccessApi/GetUtilityExternalSharedData"
params = {"apikey": apiKey}
headers = {"Content-Type": "application/json"}
auth = (apiUsername,apiPass)
newWbesThermalGenList = appconfig['newWbesThermalGenList']
newWbesGasGenList= appconfig['newWbesGasGenList']
validBuyerAcrList = ['MSEB_Beneficiary', 'GEB_Beneficiary', 'MPSEB_Beneficiary', 'CSEB_Beneficiary']

@schVsEntApiController.route('/api/getSchVsEnt/<targetDate>/<stateAcr>/<genType>')
def schVsEntIndex(targetDate:str, stateAcr:str, genType:str): 

    genRespObj = {}
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    body = {"Date":targetDateStr,"SchdRevNo": -1,"UserName":apiUsername, "UtilAcronymList": [stateAcr], "UtilRegionIdList":[2]}   
    otherStateGenList = appconfig[stateAcr]

    try:
        resp = requests.post(newWbesUrl, params=params, auth=auth, data=json.dumps(body), headers=headers)
        if not resp.status_code == 200:
            print(resp.status_code)
            print(f"unable to get data from wbes api")
            genRespObj = {'EntOffBar': {}, 'EntOnBar': {}, 'ReqOffBar':{},'ReqOnBar':{}, 'ScheduleAmount':{}, 'EntOffBar_Sum': [], 'EntOnBar_Sum': [], 'ReqOffBar_Sum': [], 'ReqOnBar_Sum': [], 'ScheduleAmount_Sum': [], 'Rev_No':0}
            return jsonify(genRespObj)
        respJson = resp.json()
        
        revNo = respJson['ResponseBody']["FullSchdRevisionNo"]
        fullschdData = respJson['ResponseBody']["GroupWiseDataList"][0]["FullschdList"]
        requistionData = respJson['ResponseBody']["GroupWiseDataList"][0]["RequisitionList"]
        entilementData = respJson['ResponseBody']["GroupWiseDataList"][0]["EntitlementList"]
        
        # filtering only isgs sch data
        filteredSchData = list(filter(lambda gen:  (gen['BuyerAcronym'] in validBuyerAcrList) and (gen['EnergyScheduleTypeName'] =='ISGS'), fullschdData)) 
        # now filtering based on gas or thermal generator
        if genType == 'gasGenList':
            filteredReqData = list(filter(lambda gen:  (gen['BuyerAcronym'] in validBuyerAcrList) and (gen['GeneratorTypeName'] == 'GAS') , requistionData)) 
            filteredEntData = list(filter(lambda gen:  (gen['BuyerAcronym'] in validBuyerAcrList) and (gen['GeneratorTypeName'] == 'GAS') , entilementData)) 
            filteredSchData = list(filter(lambda gen:  (gen['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSGeneratorTypeName'] == 'GAS') , filteredSchData)) 
        elif genType =='thermalGenList':
            filteredReqData = list(filter(lambda gen:  (gen['BuyerAcronym'] in validBuyerAcrList) and (gen['GeneratorTypeName'] == 'THERMAL'), requistionData)) 
            filteredEntData = list(filter(lambda gen:  (gen['BuyerAcronym'] in validBuyerAcrList) and (gen['GeneratorTypeName'] == 'THERMAL') , entilementData))
            filteredSchData = list(filter(lambda gen:  (gen['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSGeneratorTypeName'] == 'THERMAL') , filteredSchData))
        #variables for current state
        allGenSchAccumulator = {}
        allGenReqOnBarAccumulator = {}
        allGenReqOffBarAccumulator = {}
        allGenEntOnBarAccumulator = {}
        allGenEntOffBarAccumulator = {}
        allGenSchSum= allGenReqOnBarSum= allGenReqOffBarSum= allGenEntOnBarSum= allGenEntOffBarSum= [0 for i in range (1,97)]

        #variables for other state
        allGenSchAccumulator_otherState = {}
        allGenReqOnBarAccumulator_otherState = {}
        allGenReqOffBarAccumulator_otherState = {}
        allGenEntOnBarAccumulator_otherState = {}
        allGenEntOffBarAccumulator_otherState = {}
        allGenSchSum_otherState= allGenReqOnBarSum_otherState= allGenReqOffBarSum_otherState= allGenEntOnBarSum_otherState= allGenEntOffBarSum_otherState= [0 for i in range (1,97)]
        
        # getting  schedule of state from all isgs gen and blockwise sum,filtering based on if acrnoym is in new wbes gas/thermal gen list
        for genData in filteredSchData:
            sellerAcr = genData['SellerAcronym']
            if genType == 'gasGenList' and (sellerAcr in newWbesGasGenList):
                schData= genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSGasFullScheduleJsonData']['TotalDrwBoundarySchdAmount']
                allGenSchAccumulator[sellerAcr]= schData
                allGenSchSum = [a + b for a, b in zip(allGenSchSum, schData)]
            elif genType =='thermalGenList' and (sellerAcr in newWbesThermalGenList):
                schData = genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSThermalFullScheduleJsonData']['TotalDrwBoundarySchdAmount']
                allGenSchAccumulator[sellerAcr]= schData
                allGenSchSum = [a + b for a, b in zip(allGenSchSum, schData)]
        
        # getting schedule for other state geneartor for current state
        for genData in fullschdData:
            sellerAcr = genData['SellerAcronym'] 
            genSdlType = genData['EnergyScheduleTypeName']
            if (sellerAcr in otherStateGenList) and (genSdlType=='ISGS'):
                isgsGenType= genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSGeneratorTypeName']
                schData=[0 for i in range(1,97)]
                if isgsGenType== 'THERMAL':
                    schData = genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSThermalFullScheduleJsonData']['TotalDrwBoundarySchdAmount']
                elif isgsGenType == 'GAS':
                    schData= genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSGasFullScheduleJsonData']['TotalDrwBoundarySchdAmount']
                elif isgsGenType == 'HYDRO':
                    schData= genData['FullScheduleData']['ISGSFullScheduleJsonData']['ISGSHydroFullScheduleJsonData']['SchdAmount']
                allGenSchAccumulator_otherState[sellerAcr]= schData
                allGenSchSum_otherState = [a + b for a, b in zip(allGenSchSum_otherState, schData)]
        
        # getting requisition of state from all isgs gen and blockwise sum,filtering based on if acrnoym is in new wbes gas/thermal gen list
        for genData in filteredReqData:
            sellerAcr = genData['SellerAcronym']
            if genType == 'gasGenList' and (sellerAcr in newWbesGasGenList):
                onBarReqData =  [a + b for a, b in zip(genData['RequisitionData']['GasReqJsonData']['CombinedOnbarReqAmount'], genData['RequisitionData']['GasReqJsonData']['OpenOnbarReqAmount'])]
                offBarReqData =  [a + b for a, b in zip(genData['RequisitionData']['GasReqJsonData']['CombinedOffbarReqAmount'], genData['RequisitionData']['GasReqJsonData']['OpenOffbarReqAmount'])]
                allGenReqOnBarAccumulator[sellerAcr ]= onBarReqData
                allGenReqOffBarAccumulator[sellerAcr]= offBarReqData
                allGenReqOnBarSum = [a + b for a, b in zip(allGenReqOnBarSum, onBarReqData)]
                allGenReqOffBarSum = [a + b for a, b in zip(allGenReqOffBarSum, offBarReqData)]      
            elif genType =='thermalGenList' and (sellerAcr in newWbesThermalGenList):
                onBarReqData = genData['RequisitionData']['ThermalReqJsonData']['OnbarReqAmount']
                offBarReqData =  genData['RequisitionData']['ThermalReqJsonData']['OffbarReqAmount']
                allGenReqOnBarAccumulator[sellerAcr ]= onBarReqData
                allGenReqOffBarAccumulator[sellerAcr]= offBarReqData
                allGenReqOnBarSum = [a + b for a, b in zip(allGenReqOnBarSum, onBarReqData)]
                allGenReqOffBarSum = [a + b for a, b in zip(allGenReqOffBarSum, offBarReqData)]

        # getting requisition of state from all other state isgs gen and blockwise sum      
        for genData in requistionData:
            sellerAcr = genData['SellerAcronym']
            if sellerAcr in otherStateGenList:
                onBarReqData=[0 for i in range(1,97)]
                offBarReqData=[0 for i in range(1,97)]
                isgsGenType= genData['GeneratorTypeName']
                if isgsGenType== 'THERMAL':
                    onBarReqData = genData['RequisitionData']['ThermalReqJsonData']['OnbarReqAmount']
                    offBarReqData =  genData['RequisitionData']['ThermalReqJsonData']['OffbarReqAmount']
                elif isgsGenType == 'GAS':
                    onBarReqData =  [a + b for a, b in zip(genData['RequisitionData']['GasReqJsonData']['CombinedOnbarReqAmount'], genData['RequisitionData']['GasReqJsonData']['OpenOnbarReqAmount'])]
                    offBarReqData =  [a + b for a, b in zip(genData['RequisitionData']['GasReqJsonData']['CombinedOffbarReqAmount'], genData['RequisitionData']['GasReqJsonData']['OpenOffbarReqAmount'])]
                elif isgsGenType == 'HYDRO':
                    onBarReqData = genData['RequisitionData']['HydroReqJsonData']['ReqAmount']
                    # offBarReqData =  genData['RequisitionData']['HydroReqJsonData']['ReqAmount']
                allGenReqOnBarAccumulator_otherState[sellerAcr ]= onBarReqData
                allGenReqOffBarAccumulator_otherState[sellerAcr]= offBarReqData
                allGenReqOnBarSum_otherState = [a + b for a, b in zip(allGenReqOnBarSum_otherState, onBarReqData)]
                allGenReqOffBarSum_otherState = [a + b for a, b in zip(allGenReqOffBarSum_otherState, offBarReqData)]

        # getting entitlement of state from all isgs gen and blockwise sum,filtering based on if acrnoym is in new wbes gas/thermal gen list
        for genData in filteredEntData:
            sellerAcr = genData['SellerAcronym']
            if genType == 'gasGenList' and (sellerAcr in newWbesGasGenList):
                onBarEntData =  [a + b for a, b in zip(genData['EntitlementData']['GasEntJsonData']['OpenFinalEntAmount'], genData['EntitlementData']['GasEntJsonData']['CombinedFinalEntAmount'])]
                offBarEntData =  genData['EntitlementData']['GasEntJsonData']['OffbarFinalEntAmount']
                allGenEntOnBarAccumulator[sellerAcr] = onBarEntData
                allGenEntOffBarAccumulator[sellerAcr]= offBarEntData
                allGenEntOnBarSum = [a + b for a, b in zip(allGenEntOnBarSum, onBarEntData)]
                allGenEntOffBarSum = [a + b for a, b in zip(allGenEntOffBarSum, offBarEntData)] 
            elif genType =='thermalGenList' and (sellerAcr in newWbesThermalGenList):
                onBarEntData = genData['EntitlementData']['ThermalEntJsonData']['OnbarFinalEntAmount']
                offBarEntData = genData['EntitlementData']['ThermalEntJsonData']['OffbarFinalEntAmount']
                allGenEntOnBarAccumulator[sellerAcr] = onBarEntData
                allGenEntOffBarAccumulator[sellerAcr]= offBarEntData
                allGenEntOnBarSum = [a + b for a, b in zip(allGenEntOnBarSum, onBarEntData)]
                allGenEntOffBarSum = [a + b for a, b in zip(allGenEntOffBarSum, offBarEntData)]

        # getting entitlement of state from all other state isgs gen and blockwise sum 
        for genData in entilementData:
            sellerAcr = genData['SellerAcronym']
            if sellerAcr in otherStateGenList:
                onBarEntData=[0 for i in range(1,97)]
                offBarEntData=[0 for i in range(1,97)]
                isgsGenType= genData['GeneratorTypeName']
                if isgsGenType== 'THERMAL':
                    onBarEntData = genData['EntitlementData']['ThermalEntJsonData']['OnbarFinalEntAmount']
                    offBarEntData = genData['EntitlementData']['ThermalEntJsonData']['OffbarFinalEntAmount']
                elif isgsGenType == 'GAS':
                    onBarEntData =  [a + b for a, b in zip(genData['EntitlementData']['GasEntJsonData']['OpenFinalEntAmount'], genData['EntitlementData']['GasEntJsonData']['CombinedFinalEntAmount'])]
                    offBarEntData =  genData['EntitlementData']['GasEntJsonData']['OffbarFinalEntAmount']
                elif isgsGenType == 'HYDRO':
                    onBarEntData = genData['EntitlementData']['HydroEntJsonData']['FinalEntAmount']
                    # offBarEntData = genData['EntitlementData']['HydroEntJsonData']['FinalEntAmount']
                allGenEntOnBarAccumulator_otherState[sellerAcr] = onBarEntData
                allGenEntOffBarAccumulator_otherState[sellerAcr]= offBarEntData
                allGenEntOnBarSum_otherState = [a + b for a, b in zip(allGenEntOnBarSum_otherState, onBarEntData)]
                allGenEntOffBarSum_otherState = [a + b for a, b in zip(allGenEntOffBarSum_otherState, offBarEntData)]
        
        currStateGenRespObj = {'EntOffBar': allGenEntOffBarAccumulator, 'EntOnBar': allGenEntOnBarAccumulator, 'ReqOffBar':allGenReqOffBarAccumulator, 
                      'ReqOnBar':allGenReqOnBarAccumulator, 'ScheduleAmount':allGenSchAccumulator, 'EntOffBar_Sum': allGenEntOffBarSum, 
                      'EntOnBar_Sum': allGenEntOnBarSum, 'ReqOffBar_Sum': allGenReqOffBarSum, 'ReqOnBar_Sum': allGenReqOnBarSum, 'ScheduleAmount_Sum': allGenSchSum, 'Rev_No':revNo}
        
        otherStateGenRespObj = {'EntOffBar': allGenEntOffBarAccumulator_otherState, 'EntOnBar': allGenEntOnBarAccumulator_otherState, 'ReqOffBar':allGenReqOffBarAccumulator_otherState, 
                      'ReqOnBar':allGenReqOnBarAccumulator_otherState, 'ScheduleAmount':allGenSchAccumulator_otherState, 'EntOffBar_Sum': allGenEntOffBarSum_otherState, 
                      'EntOnBar_Sum': allGenEntOnBarSum_otherState, 'ReqOffBar_Sum': allGenReqOffBarSum_otherState, 'ReqOnBar_Sum': allGenReqOnBarSum_otherState, 'ScheduleAmount_Sum': allGenSchSum_otherState, 'Rev_No':revNo}
    except Exception as err:
        print(f'Error while making API call is {err}')
        genRespObj = {'EntOffBar': {}, 'EntOnBar': {}, 'ReqOffBar':{},'ReqOnBar':{}, 'ScheduleAmount':{}, 'EntOffBar_Sum': [], 'EntOnBar_Sum': [], 'ReqOffBar_Sum': [], 'ReqOnBar_Sum': [], 'ScheduleAmount_Sum': [], 'Rev_No':0}
        return jsonify({'currStateGenRespObj':genRespObj, 'otherStateGenRespObj':genRespObj})
        
    return jsonify({'currStateGenRespObj':currStateGenRespObj, 'otherStateGenRespObj':otherStateGenRespObj})

