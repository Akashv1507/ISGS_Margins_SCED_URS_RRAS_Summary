
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