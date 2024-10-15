import {getSchVsEntData} from '../fetchApiData'
import {PlotData, PlotTrace, setPlotTraces } from '../plotUtils'
import {getPlotData} from "./entVsSchHelperFn"
import {getStateNameFromAcr} from "./entVsSchHelperFn"


export const fetchPlotData = async() => {

    //to display error msg
    const errorDiv = document.getElementById("errorPlotDiv") as HTMLDivElement;
  
    //to display spinner
    const spinnerDiv = document.getElementById("plotSpinner") as HTMLDivElement;
  
    //to display plot of selected state
    const plotWrapper = document.getElementById("plotsWrapper") as HTMLDivElement;

    //to display plot of other region except wr for selected state
    const otherReionPlotsWrapper = document.getElementById("otherReionPlotsWrapper") as HTMLDivElement;
  
    //get user inputs
    const targetDateValue = (
      document.getElementById("targetDate") as HTMLInputElement
    ).value;
    const stateAcr = (
        document.getElementById("state") as HTMLSelectElement
    ).value;
    const stateName = getStateNameFromAcr(stateAcr)

    const fuelType = (
          document.getElementById("genType") as HTMLSelectElement
        ).value;

    const schVsOnBarEntTraceList =[{'id':'ScheduleAmount_Sum', 'name':'Schedule_Sum', 'color':'red'},{'id':'EntOnBar_Sum', 'name':'OnBarEntitlement_Sum', 'color':'green'}] 
    const offBarEntVsOffBarReqTraceList =[{'id':'EntOffBar_Sum', 'name':'OffBarEntitlement_Sum', 'color':'red'},{'id':'ReqOffBar_Sum', 'name':'OffBarRequisition_Sum', 'color':'green'}] 

    //submit btn
    const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement
    submitBtn.classList.add("button", "disabled");

    // clearing earlier plots div, 
    plotWrapper.innerHTML = "";
    otherReionPlotsWrapper.innerHTML="";
  
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

        let allSchVsEntData  = await getSchVsEntData(
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

        //defining divs dynamically, sch vs onbar entitlement plot div for other region
        let schVsOnBarEntOtherRegionPlot = document.createElement('div');
        schVsOnBarEntOtherRegionPlot.id = `schVsOnBarEntOtherRegionPlot`;
        otherReionPlotsWrapper.appendChild(schVsOnBarEntOtherRegionPlot);
        // offbar entitlement vs off bar requisition plot div for other region
        let offBarEntVsReqOtherRegionPlot = document.createElement('div');
        offBarEntVsReqOtherRegionPlot.id = `offBarEntVsReqOtherRegionPlot`;
        otherReionPlotsWrapper.appendChild(offBarEntVsReqOtherRegionPlot);

        const schVsEntData= allSchVsEntData.currStateGenRespObj
        const allGenEntOnBarData = schVsEntData['EntOnBar']
        const allGenSdlData = schVsEntData['ScheduleAmount']
        const allGenEntOffBarData = schVsEntData['EntOffBar']
        const allGenReqOffBarData = schVsEntData['ReqOffBar']  
        
        //Schedule vs on bar entitlement plotdata
        let schVsOnBarEntPlotData: PlotData = {
            title: ` ${stateName} Schedule Vs On-Bar Entitlement In WR ISGS ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };

         //Off bar entitlement vs Off bar requisition plotdata
         let offBarEntVsOffBarReqPlotData: PlotData = {
            title: ` ${stateName} Off-Bar Entitlement Vs Off-Bar Requisition In WR ISGS ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };

        // it contains all gen of particular state selected  for sch vs ent plot 
        let sdlEntOnbargenList:string[] = [];
        // it contains all gen of particular state selected  for ent offbar vs req Offbar plot
        let reqEntOffBarGenList:string[] = []
  
        // filtering generators that contains all zero in every TB for entitlement onbar data(for plot onbar ent vs schd)                                                                                      
        for(const gen in allGenEntOnBarData) 
            {
                const genEntDataList:number[]= allGenEntOnBarData[gen]
                const sumEntOnBar = genEntDataList.reduce((a, b) => a + b)
                if (sumEntOnBar>0){
                    sdlEntOnbargenList.push(gen);}
            }

        // filtering generators that contains all zero in every TB for entitlement offbar data(for plot offbar ent vs offbar requisition)                                                                               
        for(const gen in allGenEntOffBarData) 
            {
                const genEntOffbarDataList:number[]= allGenEntOffBarData[gen]
                const sumEntOffBar = genEntOffbarDataList.reduce((a, b) => a + b)
                if (sumEntOffBar>0){
                    reqEntOffBarGenList.push(gen);}
            }
             
        //------------- Schedule vs Onbar entilement plotting start-----------
        //iterating through all gen and plotting sdl and onbar ent data of all genearators
        sdlEntOnbargenList.forEach((genName, index) => {
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
             
        //------------- Offbar requisition vs offbar entilement plotting start-----------
        //iterating through all gen and plotting offbar ent vs offbar req data 
        reqEntOffBarGenList.forEach((genName, index) => {
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

        ////////// Plots for other region except WR  \\\\\\\\\\\\\\\\\\\\\\
        //  let otherRegionSchVsEntData  = await getOtherRegionSchVsEntData(
        //     targetDateValue, stateAcr, fuelType
        // );
        const otherRegionSchVsEntData= allSchVsEntData.otherStateGenRespObj
        const otherRegionEntOnBarData = otherRegionSchVsEntData['EntOnBar']
        const otherRegionSdlData = otherRegionSchVsEntData['ScheduleAmount']
        const otherRegionEntOffBarData = otherRegionSchVsEntData['EntOffBar']
        const otherRegionReqOffBarData = otherRegionSchVsEntData['ReqOffBar']

        //Schedule vs on bar entitlement plotdata for other region except wr for selected state
        let otherRegionSchVsOnBarEntPlotData: PlotData = {
            title: ` ${stateName} Schedule Vs On-Bar Entitlement In Other Region ISGS ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };

         //Off bar entitlement vs Off bar requisition plotdata for other region except wr for selected state
         let otherRegionOffBarEntVsOffBarReqPlotData: PlotData = {
            title: `${stateName} Off-Bar Entitlement Vs Off-Bar Requisition In Other Region ISGS ${targetDateValue.substring(0,10)}`,
            traces: [],
            yAxisTitle: "--MW--",
           
        };

        // it contains all gen of particular state selected  for sch vs ent plot ->other region except wr
        let otherRegionSdlEntOnbargenList:string[] = [];
        // it contains all gen of particular state selected  for ent offbar vs req Offbar plot->other region except wr
        let otherRegionReqEntOffBarGenList:string[] = []

        // filtering generators that contains all zero in every TB for entitlement onbar data(for plot onbar ent vs schd) -> other region except wr                                                                                        
        for(const gen in otherRegionEntOnBarData) 
            {
                const genEntDataList:number[]= otherRegionEntOnBarData[gen]
                const sumEntOnBar = genEntDataList.reduce((a, b) => a + b)
                if (sumEntOnBar>0){
                    otherRegionSdlEntOnbargenList.push(gen);}
            }

        // filtering generators that contains all zero in every TB                                                                                      
        for(const gen in otherRegionEntOffBarData) 
            {
                const genEntOffbarDataList:number[]= otherRegionEntOffBarData[gen]
                const sumEntOffBar = genEntOffbarDataList.reduce((a, b) => a + b)
                if (sumEntOffBar>0){
                    otherRegionReqEntOffBarGenList.push(gen);}
            }

         //------------- Other Region Schedule vs Onbar entilement plotting start-----------
        //iterating through all gen and plotting sdl and onbar ent data of all genearators for other regions except wr 
        otherRegionSdlEntOnbargenList.forEach((genName, index) => {
            const sdlGenData = otherRegionSdlData[genName]
            const entOnBarGenData = otherRegionEntOnBarData[genName]
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
        
            otherRegionSchVsOnBarEntPlotData.traces.push(sdlTrace);
            otherRegionSchVsOnBarEntPlotData.traces.push(entOnbarTrace);
        });
        //plotting total sdl and on bar entitlement data for other regions except wr 
        for (let i=0; i<schVsOnBarEntTraceList.length;i++) {
            const entityId = schVsOnBarEntTraceList[i]['id']
            const entityName = schVsOnBarEntTraceList[i]['name']
            const entityPlotData=getPlotData(otherRegionSchVsEntData[entityId])
            let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               //fill: 'tonexty',
               line: { width: 4, color: schVsOnBarEntTraceList[i]['color']}
           };
           otherRegionSchVsOnBarEntPlotData.traces.push(singleTrace);
         } 
        
        
        //------------- Offbar requisition vs offbar entilement plotting start for other regions except wr-----------
        //iterating through all gen and plotting offbar ent vs offbar req data 
        otherRegionReqEntOffBarGenList.forEach((genName, index) => {
            const genEntoffbarData = otherRegionEntOffBarData[genName]
            const genReqOffbarGenData = otherRegionReqOffBarData[genName]
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

            otherRegionOffBarEntVsOffBarReqPlotData.traces.push(entOffbarTrace);
            otherRegionOffBarEntVsOffBarReqPlotData.traces.push(reqOffbarTrace);
        });
        //plotting total offbar requisition and off bar entitlement data for other regions except wr
        for (let i=0; i<offBarEntVsOffBarReqTraceList.length;i++) {
            const entityId = offBarEntVsOffBarReqTraceList[i]['id']
            const entityName = offBarEntVsOffBarReqTraceList[i]['name']
            const entityPlotData=getPlotData(otherRegionSchVsEntData[entityId])
           let singleTrace: PlotTrace = {
               name: `${entityName}`,
               data: entityPlotData,
               type: "scatter",
               hoverYaxisDisplay: "MW",
               line: { width: 4 , color:offBarEntVsOffBarReqTraceList[i]['color']}
               //fill: 'tonexty',
           };
           otherRegionOffBarEntVsOffBarReqPlotData.traces.push(singleTrace);
         } 

        
        setPlotTraces(
            `schVsOnBarEntOtherRegionPlot`,
            otherRegionSchVsOnBarEntPlotData
        );
        setPlotTraces(
            `offBarEntVsReqOtherRegionPlot`,
            otherRegionOffBarEntVsOffBarReqPlotData
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