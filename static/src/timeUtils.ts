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
        if (timeVal%15==14)
        {break}
        timeVal=timeVal+1
    }
    if(timeVal==29){
        blockNo= blockNo+1
    }else if(timeVal==44){
        blockNo=blockNo+2
    }
    else if(timeVal==59){
        blockNo=blockNo+3
    }
    return blockNo
}

export const getCurrentTime = ():Date=>{
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset();
    const ISTOffset = 330;   // IST offset UTC +5:30 
    const todayISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    return todayISTTime
}

export const getLastUpdatedTimeStr=():String=>{
    const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
    ];

    const todayISTTime=getCurrentTime()
    const lastUpdatedStr = `<b>${todayISTTime.getHours()}:${todayISTTime.getMinutes()}</b> Of ${todayISTTime.getDate()}-${monthNames[todayISTTime.getMonth()].substring(0,3)}.`
    return lastUpdatedStr

}