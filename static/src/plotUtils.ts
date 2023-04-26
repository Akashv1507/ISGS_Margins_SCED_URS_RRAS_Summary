import Plotly from "plotly.js-dist";
// declare var Plotly: any;
import { isgsValObj } from "./respInterfaceObj";


export interface PlotTrace {
    name: string;
    data: isgsValObj[];
    type: string;
    hoverYaxisDisplay: string
    line?: { color?: string; width?: number };
    visible?: string | boolean;
    fill?: string;
    mode?: string;
    stackgroup?: string
    offsetgroup?:string
    width?:number
    marker?:{color?:string}

}

export interface PlotData {
    title: string;
    traces: PlotTrace[];
    yAxisTitle: string
    barmode?: string
}

export const getPlotXYArrays = (
  measData: PlotTrace["data"]
): { blkNos: number[]; vals: number[] } => {
  let blkNo: number[] = [];
  let vals: number[] = [];
  for (var i = 0; i < measData.length; i = i + 1) {
    blkNo.push(measData[i].blkNo);
    vals.push(measData[i].val);
  }
  return { blkNos: blkNo, vals: vals };
};

export const setPlotTraces = (divId: string, plotData: PlotData) => {
    let traceData = [];
    const layout = {
    title: {
      text: plotData.title,
      font: {
        size: 36,
      },
    },
    // plot_bgcolor:"black",
    // paper_bgcolor:"#FFF3",
    showlegend: true,
    legend: {
      orientation: "h",
      y: -0.1,
      x: 0.1,
      font: {
        family: "sans-serif",
        size: 15,
      },
    },
    hovermode:'x',
    autosize: false,
    width: 1700,
    height: 700,
    xaxis: {
      title:'--Time Block--',
      showgrid: false,
      zeroline: true,
      showspikes: true,
      spikethickness: 1,
      showline: true,
      titlefont: { color: "#000" },
      tickfont: { color: "#000", size: 15 },
      //tickmode: "linear",
      //dtick: 180 * 60 * 1000,
      //automargin: true,
      tickangle: 283,
    },
    yaxis: {
          title: plotData.yAxisTitle,
      showgrid: true,
      zeroline: true,
      showspikes: true,
      spikethickness: 1,
      showline: true,
      automargin: true,
      titlefont: { color: "#000" },
      tickfont: { color: "#000", size: 18 },
      tickformat: "digits",
    },
    };
    //for only bar plots
    if (plotData.barmode != null) {
        layout["barmode"] = plotData.barmode
    }

  for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
    const trace = plotData.traces[traceIter];
    const xyData = getPlotXYArrays(trace.data);

    // creating different graph for bias error  , which is 2nd index of plotdata.traces
    let traceObj = {
      x: xyData.blkNos,
      y: xyData.vals,
      type: trace.type,
      name: trace.name,
      hovertemplate: `(--%{y:.0f}-- ${trace.hoverYaxisDisplay})`,
    };
    if (trace.line != null) {
      traceObj["line"] = trace.line;
    }
    if (trace.marker != null) {
      traceObj["marker"] = trace.marker;
    }
    if (trace.visible != null) {
      traceObj["visible"] = trace.visible;
    }
    if (trace.fill != null) {
      traceObj["fill"] = trace.fill;
      }
    if (trace.mode != null) {
          traceObj["mode"] = trace.mode;
      }
    if (trace.stackgroup != null) {
        traceObj["stackgroup"] = trace.stackgroup;
    }
    if (trace.offsetgroup != null) {
      traceObj["offsetgroup"] = trace.stackgroup;
  }
    if (trace.width != null) {
      traceObj["width"] = trace.width;
    }
    traceData.push(traceObj);
  }
  Plotly.newPlot(divId, traceData, layout);
};