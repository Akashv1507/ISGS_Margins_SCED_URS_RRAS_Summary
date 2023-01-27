
export interface isgsValObj {
    blkNo: number;
    val: number;
  }

export interface apiRespObj {
    [isgsGenName: string]: isgsValObj[];
  }
 
export interface ursRespObj{
  gen:string;
  beneficiary:string;
  blockRange:string
  quantum:string
}

export interface ursRespObjList{
  ursSummary:ursRespObj[];
}

export interface plotDataPoints{
  x: number[];
  y: number[];
  type: string;
  name: string;
  hovertemplate: string;
}

export interface maxMargins{
  'traceName':string;
  'val':number;
  'pointInd':number;
}