from flask import Blueprint, jsonify
from Src.appConfig import getAppConfig
import datetime as dt
import requests
import math

ursSumaaryApiController = Blueprint('ursSumaaryApiController', __name__, template_folder='templates')

appconfig= getAppConfig()

@ursSumaaryApiController.route('/api/getUrsSummary/<targetDate>/<fromBlk>/<toBlk>')
def ursSUmmaryIndex(targetDate:str, fromBlk:str, toBlk:str): 
    targetDateTimeStamp= dt.datetime.strptime(targetDate, '%Y-%m-%d')
    targetDateStr= targetDateTimeStamp.strftime('%d-%m-%Y')
    apiUsername = appconfig['wbesApiUser']
    apiPass= appconfig['wbesApiPass']
    fromBlk=int(fromBlk)-1
    toBlk=int(toBlk)
    ursRespList=[]
    
    ursApiUrl = f'https://wbes.wrldc.in/WebAccess/GetURSData?USER={apiUsername}&PASS={apiPass}&DATE={targetDateStr}'
    try:
        resp = requests.get(ursApiUrl)
        if not resp.status_code == 200:
            print(resp.status_code)
            print("unable to get data from wbes api")
            return jsonify({'ursSummary':ursRespList})
        respJson = resp.json()
        isgsGenUrsData = respJson["sellerGroupWiseData"]
        for isgsGenSeller in isgsGenUrsData:
            ursSchdList=isgsGenSeller['ursSchdList']
            for ursBeneficiary in ursSchdList:
                ursList = ursBeneficiary['ScheduledUrs'].split(',')[fromBlk:toBlk]
                intUrsList = [float(x) for x in ursList]
                minUrs= math.ceil(min(intUrsList))
                maxUrs = math.ceil(max(intUrsList))
                if maxUrs>0:
                    singleUrsObj= {'gen':isgsGenSeller['SellerAcr'], 'beneficiary':ursBeneficiary['BuyerAcr'],'blockRange':f'{fromBlk+1}-{toBlk}', 'quantum':f'{minUrs}-{maxUrs}'}
                    ursRespList.append(singleUrsObj)                                                                        
        return jsonify({'ursSummary':ursRespList})
    except Exception as err:
        print(f'Error while making API call is {err}') 
        return jsonify({'ursSummary':ursRespList})