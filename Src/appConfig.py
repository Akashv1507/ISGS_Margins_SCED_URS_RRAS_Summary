import json


def getAppConfig(fName="secret/config.json"):
    with open(fName) as f:
        appConf = json.load(f)
        return appConf