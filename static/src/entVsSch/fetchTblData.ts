import {getSchVsEntData} from '../fetchApiData'
import {getTblRows} from "./entVsSchHelperFn"

export const fetchTblData = async()=> {
    //to display error msg
    const errorDiv = document.getElementById("errorTableDiv") as HTMLDivElement;
  
    //to display spinner
    const spinnerDiv = document.getElementById("tableSpinner") as HTMLDivElement;
  
    //to display table
    const tableWrapper = document.getElementById("tableWrapper") as HTMLDivElement;

     //get Rev no div 
     const revNoDiv = document.getElementById("revNoDiv") as HTMLDivElement;
  
    //get user inputs
    const targetDateValue = (
      document.getElementById("targetDate") as HTMLInputElement
    ).value;
    const stateAcr = (
        document.getElementById("state") as HTMLSelectElement
    ).value;
    const fuelType = (
          document.getElementById("genType") as HTMLSelectElement
        ).value;
    
    //submit btn
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement
    submitBtn.classList.add("button", "disabled");

    // clearing earlier div(except for first api call), here all the datatble , and we are emptying it, hence no need to clear datatable
    tableWrapper.innerHTML = "";
  
    //validation checks, and displaying msg in error div
    if (targetDateValue === "" ) {
      errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger");
      errorDiv.innerHTML = "<b> Please Enter a Valid  Date</b>";
      submitBtn.classList.remove("button", "disabled");
    }
    else {

      //if reached this ,means no validation error ,emptying error div 
      errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger");
      errorDiv.innerHTML = "";

      //adding spinner class to spinner div
      spinnerDiv.classList.add("loader");

    try{

        let schVsEntDataResp  = await getSchVsEntData(
            targetDateValue, stateAcr, fuelType
        ); 
        let schVsEntData = schVsEntDataResp.currStateGenRespObj
        const revNo = schVsEntData['Rev_No']
        revNoDiv.innerHTML = `Current Rev No : ${revNo}`
        revNoDiv.classList.add("blink");
        
        
        //div to store tbl info
        let tblInfoDiv = document.createElement('div');
        tblInfoDiv.id = `tblInfoDiv`;
        tableWrapper.appendChild(tblInfoDiv);
        //defining table schema dynamically
        let schVsEntTbl = document.createElement('table');
        schVsEntTbl.style.width = '100px';
        schVsEntTbl.id = `schVsEntTbl`;
        schVsEntTbl.className = "table table-bordered table-hover display w-auto "
        tableWrapper.appendChild(schVsEntTbl);
        const schVsEntTblRows = getTblRows(schVsEntData)
        
        //generating column name
        const columns = [{title:'Block_No', data:'blkNo'}, {title:'Entitlement_OnBar', data:'onBarEnt'},{title:'Requistion_OnBar', data:'onBarReq'}, {title:'Schedule', data:'sdlAmount'}, {title:'Schedule-Entitlement', data:'diffSdlEnt'}, {title:'Schedule-Requisition', data:'diffSdlReq'}]
        $("#schVsEntTbl").DataTable({
            dom: "Bfrtip",
            lengthMenu: [96, 192, 188],
            data: schVsEntTblRows,
            columns: columns,
            fixedHeader: true,
        }as DataTables.Settings)
        submitBtn.classList.remove("button", "disabled");
        spinnerDiv.classList.remove("loader");
        tblInfoDiv.innerHTML= `${stateAcr} | ${targetDateValue}</b>`
        //tblInfoDiv.classList.add("divCentre")

    }
    catch(err){
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Target Date. Please Try Again</b>"  
        submitBtn.classList.remove("button", "disabled");       
        spinnerDiv.classList.remove("loader"); 
        console.log(err)
    
    }  
}
}