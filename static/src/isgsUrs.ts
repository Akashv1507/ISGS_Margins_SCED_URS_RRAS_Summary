import {getEndBlockNo, getStartBlockNo} from './timeUtils'
import {getUrsData} from './fetchApiData'
import { ursRespObjList } from './respInterfaceObj';



window.onload = async () => {
    const currentTime = new Date();
    const currentOffset = currentTime.getTimezoneOffset();
    const ISTOffset = 330;   // IST offset UTC +5:30 
    const todayISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    const tommorowIstTime = new Date(todayISTTime.getTime() + 60 * 60 * 24 * 1000);
    let todayDateStr = todayISTTime.toISOString().substring(0,10);
    let tommorowDateStr = tommorowIstTime.toISOString().substring(0,10);
    let fromTimeStr=''
    let toTimeStr=''
    const currHrs = todayISTTime.getHours()
    if (currHrs>=8 && currHrs<=14){
        fromTimeStr = todayDateStr + 'T08:00';
        toTimeStr = todayDateStr + 'T14:00';
    }
    else if (currHrs>14 && currHrs<=20){
        fromTimeStr = todayDateStr + 'T14:00';
        toTimeStr = todayDateStr + 'T20:00';
    }
    else{
        fromTimeStr = todayDateStr + 'T20:00';
        toTimeStr = tommorowDateStr + 'T08:00';
    }    
    (document.getElementById("fromTime") as HTMLInputElement).value=fromTimeStr;
    (document.getElementById("toTime") as HTMLInputElement).value=toTimeStr;
    (document.getElementById('submitBtn') as HTMLButtonElement ).onclick = refreshData;
    refreshData()
}

const refreshData = async () =>{
   
     //to display error msg
     const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
     const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
     // making submit button disabled till api call fetches data
     submitBtn.classList.add("button", "disabled")
     //get user inputs
     let fromTimeValue = (
         document.getElementById("fromTime") as HTMLInputElement
     ).value;
     let toTimeValue = (
        document.getElementById("toTime") as HTMLInputElement
    ).value;
    const targetDate= fromTimeValue.substring(0,10)
    const startBlkNo=getStartBlockNo(fromTimeValue)
    const endBlkNo= getEndBlockNo(toTimeValue) 
    //validation checks, and displaying msg in error div
     if (fromTimeValue === "" ||toTimeValue === "") {
         errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
         errorDiv.innerHTML = "<b> Please Enter a valid Time</b>";
         submitBtn.classList.remove("button", "disabled");        
     } else {
        try{
            let ursData:ursRespObjList  = await getUrsData(
                targetDate, startBlkNo, endBlkNo
            );  
            let tblDiv = document.getElementById("tblDiv") as HTMLDivElement 
            tblDiv.innerHTML=""
            let ursSummaryInfoDiv = document.createElement('div');
            ursSummaryInfoDiv.id = `ursSummaryInfo`;
            tblDiv.appendChild(ursSummaryInfoDiv);

            let ursSummaryTbl = document.createElement('table');
            ursSummaryTbl.className = "table table-bordered table-hover display ml-5 mr-5"
            ursSummaryTbl.id = `ursSummaryTbl`;
            tblDiv.appendChild(ursSummaryTbl);

            //generating column name
            const columns = [{title:'Generator Name', data:'gen'}, {title:'Beneficiary', data:'beneficiary'},{title:'Block-Range', data:'blockRange'}, {title:'Quantum', data:'quantum'}]
            $("#ursSummaryTbl").DataTable({
                dom: "Brtp",
                data: ursData.ursSummary,
                columns: columns,
                order: [[3, 'desc']],
                autoWidth:false,
                columnDefs: [
                    { "width": "10%", "targets": 0 },
                    { "width": "10%", "targets": 1 },
                    { "width": "10%", "targets": 2 },
                    { "width": "10%", "targets": 3 }
                  ]
            })
            submitBtn.classList.remove("button", "disabled");
            ursSummaryInfoDiv.innerHTML= "<b>URS SUMMARY </b>"
            ursSummaryInfoDiv.classList.add("centre")
        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Time Range. Please Try Again</b>"  
            submitBtn.classList.remove("button", "disabled");         
        }
        
     }
 };