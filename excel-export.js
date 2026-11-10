/* PAC Famiglia - esportatore XLSX locale, senza librerie esterne e senza rete */
(function(global){
 'use strict';
 const utf8=new TextEncoder();
 const xml=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
 const colLetters=n=>{let s='';for(let c=n+1;c>0;c=Math.floor((c-1)/26))s=String.fromCharCode(65+(c-1)%26)+s;return s};
 const dateSerial=iso=>{
   if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return null;
   const [y,m,d]=iso.split('-').map(Number);
   const time=Date.UTC(y,m-1,d);
   if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==iso)return null;
   return (time-Date.UTC(1899,11,30))/86400000;
 };
 const styleType={text:0,integer:5,money:2,percent:3,date:4,quantity:6};
 function makeSheet(sheet){
   const cs=sheet.columns;const rows=sheet.rows||[];
   if(rows.length>200000)throw new Error('Troppi movimenti per l’esportazione su iPhone.');
   if(cs.length>50||!cs.length)throw new Error('Numero di colonne non valido.');
   const columns=cs.map(c=>`<col min="${cs.indexOf(c)+1}" max="${cs.indexOf(c)+1}" width="${Math.min(Math.max(10,c[2]||18),45)}" customWidth="1"/>`).join('');
   const header=`<row r="1" ht="27" customHeight="1">${cs.map((c,j)=>`<c r="${colLetters(j)}1" t="inlineStr" s="1"><is><t>${xml(c[0])}</t></is></c>`).join('')}</row>`;
   const body=rows.map((row,i)=>{
     const rn=i+2;
     const cells=cs.map((col,j)=>{
       const raw=row[j];if(raw===null||raw===undefined||raw==='')return '';
       const address=colLetters(j)+rn;let value=raw;
       const type=col[1]||'text';
       const fmt=styleType[type]??0;
       if(raw&&typeof raw==='object'&&typeof raw.formula==='string'){
         const val=Number(raw.value);
         const v=Number.isFinite(val)?`<v>${val}</v>`:'<v></v>';
         return `<c r="${address}" s="${fmt}"><f>${xml(raw.formula)}</f>${v}</c>`;
       }
       if(type==='date'){
         const num=dateSerial(String(value));
         return num===null?`<c r="${address}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`:`<c r="${address}" s="4"><v>${num}</v></c>`;
       }
       if(type==='money'||type==='integer'||type==='percent'||type==='quantity'){
         value=Number(value);
         if(Number.isFinite(value))return `<c r="${address}" s="${fmt}"><v>${value}</v></c>`;
         return '';
       }
       return `<c r="${address}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
     }).join('');
     return `<row r="${rn}"${i%2?' s="7" customFormat="1"':''}>${cells}</row>`;
   }).join('');
   const maxRow=rows.length+1,lastCol=colLetters(cs.length-1);
   return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastCol}${maxRow}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="17"/><cols>${columns}</cols><sheetData>${header}${body}</sheetData><autoFilter ref="A1:${lastCol}${maxRow}"/></worksheet>`;
 }
 function styleSheet(){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="3"><numFmt numFmtId="164" formatCode="#,##0.00&quot; €&quot;;[Red](#,##0.00&quot; €&quot;)"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/><numFmt numFmtId="166" formatCode="0.00000000"/></numFmts><fonts count="2"><font><sz val="11"/><color rgb="FF132A2B"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF176E61"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="10" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="1" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`}
 const crcTable=(()=>{let t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t})();
 function crc(bytes){let c=0xffffffff;for(let i=0;i<bytes.length;i++)c=crcTable[(c^bytes[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}
 function zip(entries){
   const files=[],central=[];let offset=0;
   const add=(parts,n)=>{const data=new Uint8Array(n);const view=new DataView(data.buffer);parts.push({data,view});return {data,view}};
   const w16=(v,pos,num)=>v.setUint16(pos,num,true),w32=(v,pos,num)=>v.setUint32(pos,num>>>0,true);
   const date=new Date(),year=Math.max(1980,date.getFullYear()),dt=((year-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate(),tm=(date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1);
   for(const [name,content] of entries){
     const nb=utf8.encode(name),data=utf8.encode(content);const sum=crc(data);
     const {data:head,view:h}=add(files,30);w32(h,0,0x04034b50);w16(h,4,20);w16(h,6,0x0800);w16(h,8,0);w16(h,10,tm);w16(h,12,dt);w32(h,14,sum);w32(h,18,data.length);w32(h,22,data.length);w16(h,26,nb.length);w16(h,28,0);files.push({data:nb},{data});
     const {view:c}=add(central,46);w32(c,0,0x02014b50);w16(c,4,20);w16(c,6,20);w16(c,8,0x0800);w16(c,10,0);w16(c,12,tm);w16(c,14,dt);w32(c,16,sum);w32(c,20,data.length);w32(c,24,data.length);w16(c,28,nb.length);w16(c,30,0);w16(c,32,0);w16(c,34,0);w16(c,36,0);w32(c,38,0);w32(c,42,offset);central.push({data:nb});
     offset+=30+nb.length+data.length;
   }
   const centralLength=central.reduce((s,p)=>s+p.data.length,0);
   const {view:e}=add(central,22);w32(e,0,0x06054b50);w16(e,4,0);w16(e,6,0);w16(e,8,entries.length);w16(e,10,entries.length);w32(e,12,centralLength);w32(e,16,offset);w16(e,20,0);
   const all=[...files,...central].map(x=>x.data);
   return new Blob(all,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 }
 function build(sheets){
   if(!Array.isArray(sheets)||!sheets.length||sheets.length>15)throw Error('Fogli Excel non validi.');
   const seen=new Set();for(const s of sheets){if(!s||!/^[^\\\/\?\*\[\]:]{1,31}$/.test(s.name)||seen.has(s.name))throw Error('Nome foglio non valido.');seen.add(s.name)}
   const files=[];
   const content=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
   files.push(['[Content_Types].xml',content]);
   files.push(['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>']);
   files.push(['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`]);
   files.push(['xl/_rels/workbook.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`]);
   files.push(['xl/styles.xml',styleSheet()]);
   sheets.forEach((sheet,i)=>files.push([`xl/worksheets/sheet${i+1}.xml`,makeSheet(sheet)]));
   return zip(files);
 }
 global.PacExcel={build};
})(window);
