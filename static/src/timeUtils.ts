export const getStartBlockNo= (dateTimeVal:string):number=>{

    const dateTime = new Date(dateTimeVal)
    const hrsVal = dateTime.getHours()
    let timeVal = dateTime.getMinutes()
    let blockNo= hrsVal*4 +1
    while(true){
        if (timeVal%15==0)
        {break}
        timeVal=timeVal-1
    }
    if (timeVal==15){
        blockNo= blockNo+1
    }else if(timeVal==30){
        blockNo= blockNo+2
    }else if(timeVal==45){
        blockNo=blockNo+3
    }
    return blockNo
}

export const getEndBlockNo= (dateTimeVal:string):number=>{

    const dateTime = new Date(dateTimeVal)
    const hrsVal = dateTime.getHours()
    let timeVal = dateTime.getMinutes()
    let blockNo= hrsVal*4 +1
    while(true){
        if (timeVal%15==0)
        {break}
        timeVal=timeVal+1
    }
    if(timeVal==30){
        blockNo= blockNo+1
    }else if(timeVal==45){
        blockNo=blockNo+2
    }
    return blockNo
}