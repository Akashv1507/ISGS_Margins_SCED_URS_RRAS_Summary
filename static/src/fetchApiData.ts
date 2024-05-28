import {apiRespObj,ursRespObjList, schVsEntRespObj,rooftopSolarObj} from "./respInterfaceObj"


export const getIsgsMarginsData = async (
    targetDate: string, 
  ): Promise< apiRespObj| null> => {
    try {
      const resp = await fetch(`/api/getIsgsMargins/${targetDate}`, {
        method: "get",
      });
      const respJSON = await resp.json();
      return respJSON;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

export const getIsgsScedData = async (
  targetDate: string, 
): Promise< apiRespObj| null> => {
  try {
    const resp = await fetch(`/api/getIsgsSced/${targetDate}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getIsgsRrasData = async (
  targetDate: string, 
): Promise< apiRespObj| null> => {
  try {
    const resp = await fetch(`/api/getIsgsRras/${targetDate}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getUrsData = async (
  targetDate: string, 
  startBlk:number,
  endBlk:number
): Promise< ursRespObjList| null> => {
  try {
    const resp = await fetch(`/api/getUrsSummary/${targetDate}/${startBlk}/${endBlk}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};


export const getSchVsEntData = async (
  targetDate: string, 
  stateAcr:string,
  fuelType:string
): Promise< schVsEntRespObj| null> => {
  try {
    const resp = await fetch(`/api/getSchVsEnt/${targetDate}/${stateAcr}/${fuelType}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getOtherRegionSchVsEntData = async (
  targetDate: string, 
  stateAcr:string,
  fuelType:string
): Promise< schVsEntRespObj| null> => {
  try {
    const resp = await fetch(`/api/getSchVsEntOtherRegion/${targetDate}/${stateAcr}/${fuelType}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getRooftopSolarData = async (
  startTime: string, 
  endTime:string
): Promise< rooftopSolarObj[]| null> => {
  try {
    const resp = await fetch(`/api/getRooftopSolarData/${startTime}/${endTime}`, {
      method: "get",
    });
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return null;
  }
};