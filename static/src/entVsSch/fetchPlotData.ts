import {getSchVsEntData} from '../fetchApiData'
import {PlotData, PlotTrace, setPlotTraces } from '../plotUtils'
import {getPlotData} from "./entVsSchHelperFn"


export const fetchPlotData = async() => {

    //to display error msg
    const errorDiv = document.getElementById("errorPlotDiv") as HTMLDivElement;
  
    //to display spinner
    const spinnerDiv = document.getElementById("plotSpinner") as HTMLDivElement;
  
    //to display plot
    const plotWrapper = document.getElementById("plotsWrapper") as HTMLDivElement;
  
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

    const schVsOnBarEntTraceList =[{'id':'ScheduleAmount_Sum', 'name':'Schedule_Sum', 'color':'red'},{'id':'EntOnBar_Sum', 'name':'OnBarEntitlement_Sum', 'color':'green'}] 
    const offBarEntVsOffBarReqTraceList =[{'id':'EntOffBar_Sum', 'name':'OffBarEntitlement_Sum', 'color':'red'},{'id':'ReqOffBar_Sum', 'name':'OffBarRequisition_Sum', 'color':'green'}] 

    //submit btn
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement
    submitBtn.classList.add("button", "disabled");

    // clearing earlier div(except for first api call), here all the datatble , and we are emptying it, hence no need to clear datatable
    plotWrapper.innerHTML = "";
  
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

        let schVsEntData  = await getSchVsEntData(
            targetDateValue, stateAcr, fuelType
        ); 

        //defining divs dynamically, sch vs onbar entitlement plot div
        let schVsOnBarEntPlot = document.createElement('div');
        schVsOnBarEntPlot.id = `schVsOnBarEntPlot`;
        plotWrapper.appendChild(schVsOnBarEntPlot);
        // offbar entitlement vs off bar requisition plot div
        let offBarEntVsReqPlot = document.createElement('div');
        offBarEntVsReqPlot.id = `offBarEntVsReqPlot`;
        plotWrapper.appendChild(offBarEntVsReqPlot);
        
        //Schedule vs on bar entitlement plotdata
        let schVsOnBarEntPlotData: PlotData = {
            title: ` ${stateAcr} Schedule Vs On-Bar Entitlement ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };
        const allGenEntOnBarData = schVsEntData['EntOnBar']
        const allGenSdlData = schVsEntData['ScheduleAmount']
        const allGenEntOffBarData = schVsEntData['EntOffBar']
        const allGenReqOffBarData = schVsEntData['ReqOffBar']

        // it contains all gen of particular state selected from frontend
        let genList:string[] = [];
        for(const gen in allGenSdlData) 
            {genList.push(gen);}
        
        
        //iterating through all gen and plotting sdl and onbar ent data of all genearators
        genList.forEach((genName, index) => {
            const sdlGenData = allGenSdlData[genName]
            const entOnBarGenData = allGenEntOnBarData[genName]
            const sdlPlotData=getPlotData(sdlGenData)
            const entOnbarlPlotData=getPlotData(entOnBarGenData)
            let sdlTrace: PlotTrace = {
                name: `${genName}_Sdl`,
                data: sdlPlotData,
                type: "scatter",
                hoverYaxisDisplay: "MW",
                visible:"legendonly",
                line: { width: 4 }
            };
            let entOnbarTrace: PlotTrace = {
                name: `${genName}_EntOnbar`,
                data: entOnbarlPlotData,
                type: "scatter",
                hoverYaxisDisplay: "MW",
                visible:"legendonly",
                line: { width: 4 }
            };
        
            schVsOnBarEntPlotData.traces.push(sdlTrace);
            schVsOnBarEntPlotData.traces.push(entOnbarTrace);
        });
        //plotting total sdl and on bar entitlement data 
        for (let i=0; i<schVsOnBarEntTraceList.length;i++) {
            const entityId = schVsOnBarEntTraceList[i]['id']
            const entityName = schVsOnBarEntTraceList[i]['name']
            const entityPlotData=getPlotData(schVsEntData[entityId])
            let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               //fill: 'tonexty',
               line: { width: 4, color: schVsOnBarEntTraceList[i]['color']}
           };
           schVsOnBarEntPlotData.traces.push(singleTrace);
         } 
        
         //Off bar entitlement vs Off bar requisition plotdata
        let offBarEntVsOffBarReqPlotData: PlotData = {
            title: ` ${stateAcr} Off-Bar Entitlement Vs Off-Bar Requisition ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };

        //iterating through all gen and plotting sdl and onbar ent data of all genearators
        genList.forEach((genName, index) => {
            const genEntoffbarData = allGenEntOffBarData[genName]
            const genReqOffbarGenData = allGenReqOffBarData[genName]
            const reqOffbarPlotData=getPlotData(genReqOffbarGenData)
            const entOffbarlPlotData=getPlotData(genEntoffbarData)
            let entOffbarTrace: PlotTrace = {
                name: `${genName}_EntOffBar`,
                data: entOffbarlPlotData,
                type: "scatter",
                hoverYaxisDisplay: "MW",
                visible:"legendonly",
                line: { width: 4 }
            };
            let reqOffbarTrace: PlotTrace = {
                name: `${genName}_ReqOffbar`,
                data: reqOffbarPlotData,
                type: "scatter",
                hoverYaxisDisplay: "MW",
                visible:"legendonly",
                line: { width: 4 }
            };

            offBarEntVsOffBarReqPlotData.traces.push(entOffbarTrace);
            offBarEntVsOffBarReqPlotData.traces.push(reqOffbarTrace);
        });
        //plotting total offbar requisition and off bar entitlement data 
        for (let i=0; i<offBarEntVsOffBarReqTraceList.length;i++) {
            const entityId = offBarEntVsOffBarReqTraceList[i]['id']
            const entityName = offBarEntVsOffBarReqTraceList[i]['name']
            const entityPlotData=getPlotData(schVsEntData[entityId])
           let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               line: { width: 4 , color:offBarEntVsOffBarReqTraceList[i]['color']}
               //fill: 'tonexty',
           };
           offBarEntVsOffBarReqPlotData.traces.push(singleTrace);
         } 

        //setting plot traces
        setPlotTraces(
            `schVsOnBarEntPlot`,
            schVsOnBarEntPlotData
        );
 
        setPlotTraces(
            `offBarEntVsReqPlot`,
            offBarEntVsOffBarReqPlotData
        );
        submitBtn.classList.remove("button", "disabled");
        spinnerDiv.classList.remove("loader");

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