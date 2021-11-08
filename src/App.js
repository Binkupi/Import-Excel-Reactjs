import logo from './logo.svg';
import './App.css';
import React,{useState} from 'react';
import { ExportCSV } from './ExportCSV';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function SheetJSApp() {
	const [data, setData] = React.useState([]);
	const [cols, setCols] = React.useState([]);
	const [cols1,setLoad]=React.useState(true);

	const handleFile = (file) => {
		setLoad(!cols1);
		console.log("123")
		const reader = new FileReader();
		reader.onload = (e) => {
			/* Parse data */
			const ab = e.target.result;
			const wb = XLSX.read(ab, {type:'array'});
			console.log(wb.SheetNames.length);
			/* Get first worksheet */
			//tên sheet
			const wsname = wb.SheetNames[0];

			const ws = wb.Sheets[wsname];
			console.log(ws)
            var range = XLSX.utils.decode_range(wb.Sheets[wsname]['!ref']);
            range.s.c = 0; // 0 == XLSX.utils.decode_col("A")
            range.e.c = 20; // 6 == XLSX.utils.decode_col("G")
            range.s.r = 2;
			range.e.r = 10;
            var new_range = XLSX.utils.encode_range(range);

			var range2 = XLSX.utils.decode_range(wb.Sheets[wsname]['!ref']);
            range2.s.c = 0; // 0 == XLSX.utils.decode_col("A")
            range2.e.c = 20; // 6 == XLSX.utils.decode_col("G")
            range2.s.r = 0;
			range2.e.r = 0;
            var new_range2 = XLSX.utils.encode_range(range2);
			/* Convert array of arrays */
			const data = XLSX.utils.sheet_to_json(ws, {header:1,blankrows:false,range: new_range,defval: null});
           	var lstObj=[];
			 data.forEach(item=>{ 
				let obj={
					name:item[0],
					value:item[1],
					type:new Date(item[2]),
					status:item[3]
 
				}
				lstObj.push(obj);

			}
				)
			console.log(lstObj);

			const data2 = XLSX.utils.sheet_to_json(ws, {header:1,blankrows:false,range: new_range2,defval: null});
           	var lstObj2=[];
			 data2.forEach(item=>{ 
				let obj2={
					name:item[0],
					value:item[1],
					type:new Date(item[2]),
					status:item[3]
 
				}
				lstObj2.push(obj2);

			}
				)
			console.log(lstObj2);
			/* Update state */
			setData(data);
			setCols(make_cols(ws['!ref']))
		};
		reader.readAsArrayBuffer(file);
	}

	const exportFile = () => {
		/* convert state to workbook */
		const ws = XLSX.utils.aoa_to_sheet(data);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
		/* generate XLSX file and send to client */
		XLSX.writeFile(wb, "sheetjs.xlsx")
	};

	const getApi= async()=>{
		var data= await axios({
			method: 'post',
			url: 'api/loaivattus/get-all',
			headers: {'content-type': 'application/json',
			'authorization':"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMSIsIm5hbWUiOiJRdW9jRFQiLCJxdXllbkhhbiI6MX0sImlhdCI6MTYzNjI1NDE1OCwiZXhwIjoxNjM2MjU3NzU4fQ.6VtAmGBYEb9w6E2NGRiozctgihA0DPaSBoS4pD_bj_k"

		},
			data: {
			  firstName: 'Fred',
			  lastName: 'Flintstone'
			}
		  });
		  console.log(data);
	}
	return (
	<DragDropFile handleFile={handleFile}>
		<div>
			<button onClick={getApi}> get Api</button>
		</div>
		<div className="row"><div className="col-xs-12">
			<DataInput handleFile={handleFile} />
		</div></div>
		<div className="row"><div className="col-xs-12">
			<button disabled={!data.length} className="btn btn-success" onClick={exportFile}>Export</button>
		</div></div>
		<div className="row"><div className="col-xs-12">
			<OutTable data={data} cols={cols} />
		</div></div>
	</DragDropFile>
	);
}


/* -------------------------------------------------------------------------- */

/*
  Simple HTML5 file drag-and-drop wrapper
  usage: <DragDropFile handleFile={handleFile}>...</DragDropFile>
    handleFile(file:File):void;
*/

function DragDropFile({ handleFile, children }) {
	const suppress = (e) => { e.stopPropagation(); e.preventDefault(); };
	const handleDrop = (e) => { e.stopPropagation(); e.preventDefault();
		const files = e.dataTransfer.files;
		if(files && files[0]) handleFile(files[0]);
	};

	return (
		<div
			onDrop={handleDrop}
			onDragEnter={suppress}
			onDragOver={suppress}
		>
		{children}
		</div>
	);
}

/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/

function DataInput({ handleFile }) {
	const handleChange = (e) => {
		const files = e.target.files;
		if(files && files[0]) handleFile(files[0]);
	};

	return (
		<form className="form-inline">
			<div className="form-group">
				<label htmlFor="file">Drag or choose a spreadsheet file</label>
				<br />
				<input
					type="file"
					className="form-control"
					id="file"
					accept={SheetJSFT}
					onChange={handleChange}
				/>
			</div>
		</form>
	)
}

/*
  Simple HTML Table
  usage: <OutTable data={data} cols={cols} />
    data:Array<Array<any> >;
    cols:Array<{name:string, key:number|string}>;
*/
function OutTable({ data, cols }) {
	return (
		<div className="table-responsive">
			<table className="table table-striped">
				<thead>
					<tr>{cols.map((c) => <th key={c.key}>{c.name}</th>)}</tr>
				</thead>
				<tbody>
					{data.map((r,i) => 
                    <tr key={i}>
						{cols.map(c => <td key={c.key}>{ r[c.key] }</td>)}
					</tr>)}
				</tbody>
			</table>
		</div>
	);
}

/* list of supported file types */
const SheetJSFT = [
	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(x => `.${x}`).join(",");

/* generate an array of column objects */
const make_cols = refstr => {
	let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
	for(var i = 0; i < C; ++i) o[i] = {name:XLSX.utils.encode_col(i), key:i}
	return o;
};