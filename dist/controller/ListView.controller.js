sap.ui.define(["ranpak/wz/rebatelist/controller/BaseController","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/Token","sap/m/MessageToast","sap/m/MessageBox","sap/ui/core/Fragment","sap/m/BusyDialog","sap/ui/table/Column","sap/m/Text","sap/m/DatePicker","sap/m/Input","sap/ui/core/format/NumberFormat"],function(e,t,r,a,l,s,o,i,n,u,d,g,c){"use strict";return e.extend("ranpak.wz.rebatelist.controller.ListView",{onInit:function(){var e=this.getOwnerComponent();this._router=e.getRouter();this._router.getRoute("ListView").attachPatternMatched(this._handleRouteMatched,this)},_handleRouteMatched:function(e){this.oBusyDialog=new i;this.oI18n=this.getView().getModel("i18n").getResourceBundle();this.oUserEditMdl=this.getOwnerComponent().getModel("oUserEditMdl");this.oBlkUpldMdl=this.getOwnerComponent().getModel("oBlkUpldMdl");this.oFiltrKeys=["RebateID","ValidTo","CustomerID","EndUserID","MaterialID","Status"];this.oClmSbmsnDt=[];this.resetAttachMdl();const t=function(e){const t=e.text;return new a({key:t,text:t})};this.byId("inputRebateID").addValidator(t);var r=new Date;var l=new Date((new Date).setDate(r.getDate()-60));this.oUserEditMdl.setProperty("/maxDate",new Date);this.oUserEditMdl.setProperty("/minDate",l)},onFilterClear:function(e){var t=this.getView().byId("idMyRebatesFB");var r="";for(var a=0;a<this.oFiltrKeys.length;a++){r=t.getControlByKey(this.oFiltrKeys[a]);if(this.oFiltrKeys[a]==="RebateID"){r.setTokens([])}else if(this.oFiltrKeys[a]==="ValidTo"){r.setValue(null)}else if(this.oFiltrKeys[a]==="Status"){r.setSelectedKey(null)}else{r.setSelectedKeys([])}}var l=this.getView().byId("idMyRebatesPg");var s=this.getView().byId("idMyRebatesTbl");var o=s.getTable().getSelectedItems();this.onTblMutliDSlct(l,o);t.fireSearch();this.resetAttachMdl()},onBeforeRebindTbl:function(e){var l=this.getView().byId("idMyRebatesFB");var s=e.getParameter("bindingParams");var o=s.parameters.select;o+=",MaterialDescription,EndUserDescription,CustomerDescription,Currency";s.parameters.select=o;var i=l.getAllFiltersWithValues();for(var n=0;n<i.length;n++){this.formFiltersForTable(s,l,i[n])}const u=new sap.ui.core.routing.HashChanger;let d=u.getHash();if(d){d=d.split("SearchString=")[1];if(!d){return}const e=new t("RebateID",r.Contains,d);const l=new t("CustomerDescription",r.Contains,d);const o=new t("CustomerID",r.Contains,d);const i=new t([e,l,o],false);s.filters.push(i);this.byId("inputRebateID").setTokens([new a({key:d,text:d})])}},formFiltersForTable:function(e,t,r){var a=r.getName();var l=t.getControlByKey(a);var s="",o="";switch(a){case"RebateID":s=l.getTokens();o=this.formMultiFiltrMdl(s,"RebateID",true);break;case"CustomerID":s=l.getSelectedKeys();o=this.formMultiFiltrMdl(s,"CustomerID",true);break;case"ValidTo":s=l.getDateValue();o=this.formMultiFiltrMdl(s,"ValidTo",false,l);break;case"EndUserID":s=l.getSelectedKeys();o=this.formMultiFiltrMdl(s,"EndUserID",true);break;case"MaterialID":s=l.getSelectedKeys();o=this.formMultiFiltrMdl(s,"MaterialID",true);break;case"Status":s=l.getSelectedKey();o=this.formMultiFiltrMdl(s,"Status",false);break;default:break}e.filters.push(o)},formMultiFiltrMdl:function(e,r,a,l){var s=[],o="",i="",n="",u="EQ";if(a){for(var d=0;d<e.length;d++){if(r==="RebateID"){u="EQ";i=e[d].getText()}else{i=e[d].toUpperCase()}}}else{if(r==="ValidTo"){u="BT";i=this.fetchDate(l.getDateValue());n=new Date(l.getSecondDateValue().getFullYear(),l.getSecondDateValue().getMonth()+1,0);n=this.fetchDate(n)}else if(r==="Status"){i=e}}o=new t({path:r,operator:u,value1:i,value2:n});s.push(o);return new t(s)},onBeforeVariantFetch:function(e){var t=this.getView().byId("idMyRebatesFB");var r=[];var a=t.getControlByKey("RebateID").getTokens();for(var l=0;l<a.length;l++){r.push(a[l].getText())}t.setFilterData({_CUSTOM:{RebateID:r,ValidTo:t.getControlByKey("ValidTo").getValue(),CustomerID:t.getControlByKey("CustomerID").getSelectedKeys(),EndUserID:t.getControlByKey("EndUserID").getSelectedKeys(),MaterialID:t.getControlByKey("MaterialID").getSelectedKeys(),Status:t.getControlByKey("Status").getSelectedKey()}})},onVariantLoad:function(e){var t=this.getView().byId("idMyRebatesFB");var r=t.getFilterData();var l=r["_CUSTOM"];var s=[];for(var o=0;o<l.RebateID.length;o++){s.push(new a({key:l.RebateID[o],text:l.RebateID[o]}));t.getControlByKey("RebateID").setTokens(s)}t.getControlByKey("CustomerID").setSelectedKeys(l.CustomerID);t.getControlByKey("EndUserID").setSelectedKeys(l.EndUserID);t.getControlByKey("MaterialID").setSelectedKeys(l.MaterialID);t.getControlByKey("ValidTo").setValue(l.ValidTo);t.getControlByKey("Status").setSelectedKey(l.Status)},onMyRebatesExport:function(e){var t="";t="My_Rebates_"+(new Date).toISOString();e.getParameter("exportSettings").fileName=t;this.formatExportList(e)},formatExportList:function(e){var t=e.getParameter("exportSettings").workbook;var r=t.columns;t.context={sheetName:"My Rebates"};for(var a=0;a<r.length;a++){switch(r[a].label){case this.oI18n.getText("columnCustomer"):r[a].property=["CustomerDescription","CustomerID"];r[a].template="{0} ({1})";break;case this.oI18n.getText("columnRebateID"):r[a].property="RebateID";break;case this.oI18n.getText("columnEndUser"):r[a].property=["EndUserDescription","EndUserID"];r[a].template="{0} ({1})";break;case this.oI18n.getText("columnMaterial"):r[a].property=["MaterialDescription","MaterialID"];r[a].template="{0} ({1})";break;case this.oI18n.getText("columnUnit"):r[a].property="Unit";break;case this.oI18n.getText("columnListPrice"):r[a].property="ListPrice";break;case this.oI18n.getText("columnRebateAmount"):r[a].property="RebateAmount";break;case this.oI18n.getText("columnNetPrice"):r[a].property="NetPrice";break;case this.oI18n.getText("columnValidFrom"):r[a].type=sap.ui.export.EdmType.Date;r[a].property="ValidFrom";r[a].format="YYYY/MM/dd";break;case this.oI18n.getText("columnValidTo"):r[a].type=sap.ui.export.EdmType.Date;r[a].property="ValidTo";r[a].format="YYYY/MM/dd";break;case this.oI18n.getText("columnStatus"):r[a].property="Status";break;case this.oI18n.getText("columnEndUserPrice"):r[a].property="EndUserPrice";break;default:break}}},GetStatusState:function(e){const t=this.getOwnerComponent().getModel("i18n").getResourceBundle();if(e===t.getText("filterStatusActive")){return"Success"}if(e===t.getText("filterStatusExpired")){return"Error"}},onTblMutliDSlct:function(e,t,r){var a,l;for(var s=0;s<t.length;s++){t[s].setSelected(false);a=t[s].getCells();for(var o=0;o<a.length;o++){l=a[o].getCustomData();if(l.length>0){if(l[0].getKey()==="INVOICE_NO"||l[0].getKey()==="SHIP_DATE"||l[0].getKey()==="QUANTITY_SOLD"){a[o].setVisible(false);a[o].setValue(null)}}}}e.setShowFooter(false);this.oClmSbmsnDt=[];this.oUserEditMdl.setProperty("/claimSubmissionData",this.oClmSbmsnDt);this.oUserEditMdl.refresh(true)},onTblItmSnglSlctn:function(e,t,r,a,s,o){var i;if(r==="Expired"){l.show(this.oI18n.getText("INVALID_ITEM_SELECT"));e.setSelected(false)}else{for(var n=0;n<t.length;n++){i=t[n].getCustomData();if(i.length>0){if(i[0].getKey()==="INVOICE_NO"||i[0].getKey()==="SHIP_DATE"||i[0].getKey()==="QUANTITY_SOLD"){if(a){t[n].setVisible(true)}else{t[n].setVisible(false)}}}}if(s.length===0){o.setShowFooter(false)}else{if(!o.getShowFooter()){o.setShowFooter(true)}}}},onTblItmSlct:function(e){var t=this.getView().byId("idMyRebatesPg");var r=e.getParameter("listItems");if(r.length>1){this.onTblMutliDSlct(t,r)}else{var a=this.getView().byId("idMyRebatesTbl");var l=a.getTable().getSelectedItems();var s=e.getParameter("listItem");var o=s.getBindingContext().getObject();var i=o.Status;var n=s.getCells();var u=e.getParameter("selected");this.onTblItmSnglSlctn(s,n,i,u,l,t);this.formClmSubmsnDt(o,u)}},formClmSubmsnDt:function(e,t){e.End_User_Invoice="";e.End_User_Ship_Date="";e.Quantity="";if(t){this.oClmSbmsnDt.push(e)}else{for(var r=0;r<this.oClmSbmsnDt.length;r++){if(e.ID===this.oClmSbmsnDt[r].ID){this.oClmSbmsnDt.splice(r)}}}this.oUserEditMdl.setProperty("/claimSubmissionData",this.oClmSbmsnDt);this.oUserEditMdl.refresh(true)},onClmFldEdit:function(e){var t=e.getSource().getCustomData()[0].getKey();var r=e.getSource().getBindingContext().getObject();for(var a=0;a<this.oClmSbmsnDt.length;a++){if(r.ID===this.oClmSbmsnDt[a].ID){if(t==="INVOICE_NO"){var s=this.validateAlphaNumFld(e);if(s){e.getSource().setValueState("None");this.oClmSbmsnDt[a].End_User_Invoice=e.getSource().getValue()}else{l.show(this.oI18n.getText("INVALID_ENTRY"));e.getSource().setValueState("Error");e.getSource().setValue(null)}}else if(t==="SHIP_DATE"){this.oClmSbmsnDt[a].End_User_Ship_Date=e.getSource().getValue()}else if(t==="QUANTITY_SOLD"){var o=this.validateNumberFld(e);if(o){e.getSource().setValueState("None");this.oClmSbmsnDt[a].Quantity=e.getSource().getValue()}else{l.show(this.oI18n.getText("INVALID_ENTRY"));e.getSource().setValueState("Error");e.getSource().setValue(null)}}}}this.oUserEditMdl.setProperty("/claimSubmissionData",this.oClmSbmsnDt);this.oUserEditMdl.refresh(true)},validatePayload:function(){var e=1;var t=this.getView().byId("idMyRebatesTbl");var r=t.getTable().getSelectedItems();var a,l,s;for(var i=0;i<r.length;i++){a=r[i].getCells();for(var n=0;n<a.length;n++){l=a[n].getCustomData();if(l.length>0){s=l[0].getKey();if(s==="INVOICE_NO"||s==="SHIP_DATE"||s==="QUANTITY_SOLD"){if(!a[n].getValue()){a[n].setValueState("Error");e=0}else{a[n].setValueState("None")}}}}}if(e===1){this.oBusyDialog.open();e=2;var u=this.getView();var d=this;if(!this.byId("idAttachmentDlg")){o.load({id:u.getId(),name:"ranpak.wz.rebatelist.fragment.attachmentDlg",controller:this}).then(function(e){u.addDependent(e);e.open();u.byId("idMyRebatesPg").setShowFooter(false);d.oBusyDialog.close()})}else{this.byId("idAttachmentDlg").open();this.byId("idMyRebatesPg").setShowFooter(false);this.oBusyDialog.close()}}return e},onAttachmentUpload:function(e){var t=e.getSource().oFileUpload.files;var r=this.getOwnerComponent().getModel("oAttachmentMdl");var a=r.getProperty("/results");this.formAttachments(t,r,a)},formAttachments:function(e,t,r){var a="",s="",o="",i="",n=0;for(var u=0;u<e.length;u++){a=e[u].name;o=e[u].size;s=e[u].size/(1024*1024);s=parseFloat(s.toFixed(2));i=a.substring(a.lastIndexOf(".")+1,a.length)||a;i=i.toUpperCase();if(i==="XLSX"||i==="XLS"||i==="CSV"||i==="PNG"||i==="JPEG"||i==="JPG"||i==="PDF"||i==="DOCX"||i==="DOC"||i==="TXT"||i==="PPTX"||i==="PPT"||i==="MSG"||i==="EML"){for(var d=0;d<r.length;d++){n+=r[d].FilesizeMB}n+=s;if(n>50){l.show(this.oI18n.getResourceBundle().getText("DOC_SIZE_ERROR"))}else{this.updateAttachmentsModel(e[u],t,r,a,o,s,i)}}else{l.show(this.oI18n.getResourceBundle().getText("SUPPORTED_DOC"))}}},updateAttachmentsModel:function(e,t,r,a,l,s,o){var i=this.getView().byId("idSubmitWithDocBtn");var n=this.getView().byId("idBlkSubmitBtn");var u=new FileReader;u.readAsDataURL(e);u.onloadend=function(e){if(e.target.readyState===FileReader.DONE){var u=e.target.result;var d=u.split(",")[1];r.push({b64Content:d,fileName:a,fileSizeBytes:l,fileSize:s+" MB",fileType:o});t.refresh(true);if(i){i.setEnabled(true)}if(n){n.setEnabled(true)}}}},onSubmitClm:function(){var e=this.validatePayload();if(e===0){s.error(this.oI18n.getText("VALIDATE_PAYLOAD_ERR"))}},onAttachmentDel:function(e){var t=this.getOwnerComponent().getModel("oAttachmentMdl");var r=t.getProperty("/results");var a=e.getSource().getBindingContext("oAttachmentMdl");var l=a.getPath().split("/")[2];r.splice(l,1);t.refresh(true);if(r.length===0){if(this.byId("idSubmitWithDocBtn")){this.byId("idSubmitWithDocBtn").setEnabled(false)}if(this.byId("idBlkSubmitBtn")){this.byId("idBlkSubmitBtn").setEnabled(false)}}},onSubmitClmWithDoc:function(){this.triggerRebateClmSubmit()},formClmPayload:function(){var e=[];var t="",r;for(var a=0;a<this.oClmSbmsnDt.length;a++){r=10-this.oClmSbmsnDt[a].RebateID.length;for(var l=0;l<r;l++){t+="0"}t+=this.oClmSbmsnDt[a].RebateID;e.push({Rebate_ID:t,Sales_Organization:"",Distributor_No:this.oClmSbmsnDt[a].CustomerID,Distributor_Name:this.oClmSbmsnDt[a].CustomerDescription,End_User_No:this.oClmSbmsnDt[a].EndUserID,End_user_Name:this.oClmSbmsnDt[a].EndUserDescription,End_User_City:"",End_user_State:"",Your_Sales_Office:"",Your_Sales_Office_Name:"",Your_Item:"",Your_Item_Description:"",Ranpak_Item:this.oClmSbmsnDt[a].MaterialID,End_User_Invoice:this.oClmSbmsnDt[a].End_User_Invoice,End_User_Ship_Date:this.oClmSbmsnDt[a].End_User_Ship_Date,col16:"",col17:"",Resale_Price:"",List_Price:this.oClmSbmsnDt[a].ListPrice,Rebate_Amount:this.oClmSbmsnDt[a].RebateAmount,Net_Price:this.oClmSbmsnDt[a].NetPrice,Quantity:this.oClmSbmsnDt[a].Quantity,UOM:this.oClmSbmsnDt[a].Unit,Customer_Reference:""})}var s={file_name:"REBATE_CLAIM",dummytoexcelset:e,dummytomessageset:[]};return s},triggerRebateClmSubmit:function(e){this.oBusyDialog.open();var t=this;var r="";if(e){r=this.formBlkClmPayload()}else{r=this.formClmPayload()}var a=this.getOwnerComponent().getModel("oPOSTMdl");a.create("/dummyheaderSet",r,{success:function(e){var r=e.dummytomessageset.results;var a="",l="",o="",i="",n=0;for(var u=0;u<r.length;u++){l=r[u].Message_Type;a=r[u].Messages;if(r.length===t.oClmSbmsnDt.length){i=t.oClmSbmsnDt[u].Rebate_ID;if(l==="E"){if(a){a=a.split(":")[1]}o+="\nRebate ID "+i+" : "+a}else if(l==="S"){n=1;o+=a;t.upldDocToSharePoint(o)}}else{if(l==="E"){o+="\n"+a}else if(l==="S"){n=1;o+="\n"+a;t.upldDocToSharePoint(o)}}}if(n===0){s.error(o);t.oBusyDialog.close()}},error:function(e){t.oBusyDialog.close();var r=JSON.parse(e.responseText);s.error(r.error.message.value)}})},onClmWithDocCncl:function(){this.resetAttachMdl();this.byId("idAttachmentDlg").close();this.byId("idMyRebatesPg").setShowFooter(true)},upldDocToSharePoint:function(e){this.oBusyDialog.open();var t=this;var r=this.getOwnerComponent().getModel("oAttachmentMdl");var a=r.getProperty("/results");var l=[];for(var o=0;o<a.length;o++){l.push({name:a[o].fileName,content:a[o].b64Content})}var i={customerId:this.oClmSbmsnDt[0].CustomerID,customerName:this.oClmSbmsnDt[0].CustomerDescription,rebateClaimNo:this.oClmSbmsnDt[0].RebateID,docs:l};var n=this.getOwnerComponent().getModel();n.create("/UploadDocuments",i,{success:function(r){t.byId("idAttachmentDlg").close();t.oBusyDialog.close();s.success(e+"\n"+"Supporting documents uploaded successfully",{onClose:function(){t.onFilterClear()}})},error:function(r){t.byId("idAttachmentDlg").close();t.oBusyDialog.close();var a=JSON.parse(r.responseText);var l=a.error.message.value+". "+t.oI18n.getText("TRY_AGAIN");s.error(e+"\n"+l)}})},onBulkBtnPress:function(){this.oBusyDialog.open();var e=this.getView();var t=this;if(!this.byId("idBlkRbtClmDlg")){o.load({id:e.getId(),name:"ranpak.wz.rebatelist.fragment.bulkRebateClaimWizard",controller:this}).then(function(r){e.addDependent(r);r.open();t.oBlkRbtClmWiz=e.byId("idBlkRbtClmWiz");t.idDwnldTmpltWizStp=e.byId("idDwnldTmpltWizStp");t.oUpldTmpltWizStp=e.byId("idUpldTmpltWizStp");t.oReviewWizStp=e.byId("idReviewWizStp");t.oAttachUpldWizStp=e.byId("idAttachUpldWizStp");var a=e.byId("idMyRebatesPg");var l=e.byId("idMyRebatesTbl");var s=l.getTable().getSelectedItems();t.onTblMutliDSlct(a,s);t.resetBlkClmWiz();t.oBusyDialog.close()})}else{this.byId("idBlkRbtClmDlg").open();var r=e.byId("idMyRebatesPg");var a=e.byId("idMyRebatesTbl");var l=a.getTable().getSelectedItems();this.onTblMutliDSlct(r,l);this.resetBlkClmWiz();this.oBusyDialog.close()}},resetBlkClmWiz:function(){this.oBlkRbtClmWiz.setCurrentStep(this.idDwnldTmpltWizStp);var e=this.getView().byId("idBlkSubmitBtn");e.setEnabled(false);this.resetAttachMdl()},onBlkCncl:function(){this.resetBlkClmWiz();this.byId("idBlkRbtClmDlg").close()},onDwnldTemplt:function(){var e=this.getAppModulePath()+"/artifacts/Rebate-Claim-Template.xlsx";sap.m.URLHelper.redirect(e,true);this.oBlkRbtClmWiz.setCurrentStep(this.oUpldTmpltWizStp)},onUpldTemplt:function(e){this.oBusyDialog.open();var t=e.getSource().oFileUpload.files[0];this.oParseExcel(t)},oParseExcel:function(e){var t=this;var r={},a="";if(e&&window.FileReader){var l=new FileReader;l.onload=function(l){var o=l.target.result;var i=XLSX.read(o,{type:"binary"});i.SheetNames.forEach(function(e){a=i.Sheets[e];r=XLSX.utils.sheet_to_row_object_array(a)});if(r.length>0){t.setExcelDtToTbl(a,r);t.generateTable();t.oBlkRbtClmWiz.setCurrentStep(t.oReviewWizStp);t.oBlkRbtClmWiz.setCurrentStep(t.oAttachUpldWizStp);t.upldTmpltToAttachMdl(e)}else{s.error(t.oI18n.getText("UPLOAD_FILE_EMPTY"));t.oBlkRbtClmWiz.setCurrentStep(t.oUpldTmpltWizStp)}};l.readAsBinaryString(e)}},upldTmpltToAttachMdl:function(e){var t=this;var r,a,l,s;r=e.name;a=e.size;l=e.size/(1024*1024);l=parseFloat(l.toFixed(2));s=r.substring(r.lastIndexOf(".")+1,r.length)||r;s=s.toUpperCase();var o=this.getOwnerComponent().getModel("oAttachmentMdl");var i=o.getProperty("/results");var n=new FileReader;n.readAsDataURL(e);n.onloadend=function(e){if(e.target.readyState===FileReader.DONE){var n=e.target.result;var u=n.split(",")[1];i.push({b64Content:u,fileName:r,fileSizeBytes:a,fileSize:l+" MB",fileType:s});o.refresh(true);t.oBusyDialog.close()}}},setExcelDtToTbl:function(e,t){const r=[];const a=XLSX.utils.decode_range(e["!ref"]).e.c+1;for(let t=0;t<a;++t){if(e[XLSX.utils.encode_col(t)+1]){r[t]=e[XLSX.utils.encode_col(t)+1].v}}this.oBlkUpldMdl.setProperty("/columns",r);this.oBlkUpldMdl.setProperty("/rows",t)},generateTblTmplt:function(e){var t=this;var r="";var a=new Date;var l=new Date((new Date).setDate(a.getDate()-60));if(e){if(e.toUpperCase().indexOf("DATE")!==-1){r=new d({value:{path:"oBlkUpldMdl>"+e,formatter:this.validateDateFldBlk},displayFormat:"YYYY/MM/dd",valueFormat:"YYYY-MM-dd",change:function(e){this.setValueState("None");if(e.getSource().getBindingContext("oBlkUpldMdl")){e.getSource().getBindingContext("oBlkUpldMdl").getObject()[e.getSource().getBindingInfo("value").parts[0].path]=e.getSource().getValue()}},maxDate:a,minDate:l});return r}else if(e.toUpperCase().indexOf("#")!==-1||e.toUpperCase().indexOf("NUMBER")!==-1){r=new g({value:{path:"oBlkUpldMdl>"+e,formatter:this.validateNumFldBlk},change:function(e){var r=t.validateNumberFld(e);if(r){e.getSource().setValueState("None")}else{e.getSource().setValueState("Error");e.getSource().setValue(null)}if(e.getSource().getBindingContext("oBlkUpldMdl")){e.getSource().getBindingContext("oBlkUpldMdl").getObject()[e.getSource().getBindingInfo("value").parts[0].path]=e.getSource().getValue()}}});return r}else if(e.toUpperCase().indexOf("AMOUNT")!==-1||e.toUpperCase().indexOf("PRICE")!==-1){r=new g({value:{path:"oBlkUpldMdl>"+e,formatter:this.validateAmntFldBlk},change:function(e){var r=e.getSource().getValue();var a=c.getCurrencyInstance({currencyCode:false,decimals:2});var l=t.validateNumberFld(e);if(l){e.getSource().setValueState("None");e.getSource().setValue(a.format(r))}else{e.getSource().setValueState("Error");e.getSource().setValue(null)}if(e.getSource().getBindingContext("oBlkUpldMdl")){e.getSource().getBindingContext("oBlkUpldMdl").getObject()[e.getSource().getBindingInfo("value").parts[0].path]=e.getSource().getValue()}}});return r}else{r=new g({value:{path:"oBlkUpldMdl>"+e,formatter:this.validateAlphaNumFldBlk},change:function(e){var r=t.validateAlphaNumFld(e);if(r){e.getSource().setValueState("None")}else{e.getSource().setValueState("Error");e.getSource().setValue(null)}if(e.getSource().getBindingContext("oBlkUpldMdl")){e.getSource().getBindingContext("oBlkUpldMdl").getObject()[e.getSource().getBindingInfo("value").parts[0].path]=e.getSource().getValue()}}});return r}}else{r=new g({value:{path:"oBlkUpldMdl>"+e,formatter:this.validateAlphaNumFldBlk},change:function(e){var r=t.validateAlphaNumFld(e);if(r){e.getSource().setValueState("None")}else{e.getSource().setValueState("Error");e.getSource().setValue(null)}if(e.getSource().getBindingContext("oBlkUpldMdl")){e.getSource().getBindingContext("oBlkUpldMdl").getObject()[e.getSource().getBindingInfo("value").parts[0].path]=e.getSource().getValue()}}});return r}},generateTable:function(){var e=this;var t=this.getView().byId("idBlkUpldTbl");t.bindColumns("oBlkUpldMdl>/columns",function(t,r){var a=r.getObject();if(a&&a.indexOf("/")!==-1){a=a.split("/")[0]}var l=e.generateTblTmplt(a);return new n({label:a,template:l,width:"12rem",tooltip:a,sortProperty:a,filterProperty:a})});t.bindRows("oBlkUpldMdl>/rows")},resetAttachMdl:function(){var e=this.getOwnerComponent().getModel("oAttachmentMdl");e.setProperty("/results",[]);e.refresh(true)}})});
//# sourceMappingURL=ListView.controller.js.map