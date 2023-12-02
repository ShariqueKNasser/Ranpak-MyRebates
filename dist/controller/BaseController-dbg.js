sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/NumberFormat",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (Controller, NumberFormat, MessageToast, MessageBox, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("ranpak.wz.rebatelist.controller.BaseController", {
		getAppModulePath: function () {
			var oModulePath = jQuery.sap.getModulePath("ranpak.wz.rebatelist");
			return oModulePath;
		},

		fetchDate: function (oDate) {
			const itzOffset = oDate.getTimezoneOffset() * 60000;
			const dAdustedDate = new Date(oDate.getTime() - itzOffset);

			return dAdustedDate
		},

		validateNumberFld: function (oEvent) {
			var oRtrnVal = false;
			var oVal = oEvent.getSource().getValue();
			var oRegEx = /^\d+$/;
			if (oRegEx.test(oVal)) {
				oRtrnVal = true;
			}

			return oRtrnVal;
		},

		validateAlphaNumFld: function (oEvent) {
			var oRtrnVal = false;
			var oVal = oEvent.getSource().getValue();
			var oRegEx = /^[\w\-\s]+$/;
			if (oRegEx.test(oVal)) {
				oRtrnVal = true;
			}

			return oRtrnVal;
		},

		validateNumFldBlk: function (oVal) {
			var oFinalVal = "";
			var oRegEx = /^\d+$/;
			if (oVal) {
				if (oRegEx.test(oVal)) {
					oFinalVal = oVal;
					this.setValueState("None");
				} else {
					this.setValueState("Error");
				}
			} else {
				this.setValueState("None");
			}

			return oFinalVal;
		},

		validateAlphaNumFldBlk: function (oVal) {
			var oFinalVal = "";
			var oRegEx = /^[\w\-\s]+$/;
			if (oVal) {
				if (oRegEx.test(oVal)) {
					oFinalVal = oVal;
					this.setValueState("None");
				} else {
					this.setValueState("Error");
				}
			} else {
				this.setValueState("None");
			}

			if (this.getBindingContext("oBlkUpldMdl")) {
				this.getBindingContext("oBlkUpldMdl").getObject()[this.getBindingInfo("value").parts[0].path] = oFinalVal;
			}

			return oFinalVal;
		},

		validateAmntFldBlk: function (oVal) {
			var oFinalVal = "";
			var oAmountFormat = NumberFormat.getCurrencyInstance({
				"currencyCode": false,
				"decimals": 2
			});

			var oRegEx = /^\d+$/;
			if (oVal) {
				var oValToFormat = oAmountFormat.parse(oVal);
				if (oValToFormat) {
					oVal = oAmountFormat.parse(oVal)[0];
				}

				if (oRegEx.test(oVal)) {
					oFinalVal = oVal;
					oFinalVal = oAmountFormat.format(oVal);
					this.setValueState("None");
				} else {
					this.setValueState("Error");
				}
			} else {
				this.setValueState("None");
			}

			if (this.getBindingContext("oBlkUpldMdl")) {
				this.getBindingContext("oBlkUpldMdl").getObject()[this.getBindingInfo("value").parts[0].path] = oFinalVal;
			}

			return oFinalVal;
		},

		validateDateFldBlk: function (oVal) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY/MM/dd"
			});
			var oFinalVal = "";
			var oValidDate = isNaN(Date.parse(oVal));
			if (!oValidDate) {
				oFinalVal = oVal;
				oFinalVal = oDateFormat.format(new Date(oFinalVal));
				this.setValueState("None");
			} else {
				this.setValueState("Error");
			}

			if (this.getBindingContext("oBlkUpldMdl")) {
				this.getBindingContext("oBlkUpldMdl").getObject()[this.getBindingInfo("value").parts[0].path] = oFinalVal;
			}

			return oFinalVal;
		},

		validateBlkPayload: function () {
			this.oErrFlds = [];
			var oFlag = true;
			var oBlkUpldTbl = this.getView().byId("idBlkUpldTbl");
			// var oBlkUpldMdl = this.getOwnerComponent().getModel("oBlkUpldMdl");
			// var oBlkUpldMdlDt = oBlkUpldMdl.getData();
			// var oCols = oBlkUpldMdlDt.columns;
			// var oRows = oBlkUpldMdlDt.rows;
			// for (var i = 0; i < oCols.length; i++) {
			// 	for (var j = 0; j < oRows.length; j++) {
			// 		if (!oRows[j][oCols[i]]) {
			// 			oFlag = false;
			// 			break;
			// 		}
			// 	}
			// }

			var oBlkTblRows = oBlkUpldTbl.getRows();
			var oBlkTblRowCells = "", oCntxt = "";
			for (var i = 0; i < oBlkTblRows.length; i++) {
				oBlkTblRowCells = oBlkTblRows[i].getCells();
				oCntxt = oBlkTblRows[i].getBindingContext("oBlkUpldMdl");
				if (oCntxt) {
					for (var j = 0; j < oBlkTblRowCells.length; j++) {
						if (oBlkTblRowCells[j].getValueState() === "Error") {
							oFlag = false;
							(this.oErrFlds).push(oBlkTblRowCells[j].getBindingInfo("value").parts[0].path + " in Line " + (i + 1));
						}
					}
				}
			}

			return oFlag;
		},

		formBlkClmPayload: function () {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var oDataToPost = [];
			var oRowKeys = "";
			var oBlkUpldMdl = this.getOwnerComponent().getModel("oBlkUpldMdl");
			var oBlkUpldMdlDt = oBlkUpldMdl.getData();
			var oCols = oBlkUpldMdlDt.columns;
			var oRows = oBlkUpldMdlDt.rows;
			for (var j = 0; j < oRows.length; j++) {
				oRowKeys = Object.keys(oRows[j]);
				var oDataObj = {}, oRebateID = "", oStrLngth;
				for (var k = 0; k < oRowKeys.length; k++) {
					if (oRowKeys[k] === "Ranpak Rebate ID #") {
						oStrLngth = 10 - (oRows[j][oRowKeys[k]].length);
						for (var i = 0; i < oStrLngth; i++) {
							oRebateID += "0";
						}
						oRebateID += oRows[j][oRowKeys[k]];
						oDataObj["Rebate_ID"] = oRebateID;
					} else if (oRowKeys[k] === "Sales Organization") {
						oDataObj["Sales_Organization"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Ranpak Distributor Number") {
						oDataObj["Distributor_No"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Distributor Name") {
						oDataObj["Distributor_Name"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Ranpak End User Number") {
						oDataObj["End_User_No"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "End user Name") {
						oDataObj["End_user_Name"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "End User City") {
						oDataObj["End_User_City"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "End user State") {
						oDataObj["End_user_State"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Your Sales Office #") {
						oDataObj["Your_Sales_Office"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Your Sales Office Name") {
						oDataObj["Your_Sales_Office_Name"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Your Item #") {
						oDataObj["Your_Item"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Your Item Description") {
						oDataObj["Your_Item_Description"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Ranpak Item #") {
						oDataObj["Ranpak_Item"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "End User Invoice #") {
						oDataObj["End_User_Invoice"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "End User Invoice Date (YYYY-MM-DD)") {
						oDataObj["End_User_Ship_Date"] = oDateFormat.format(new Date(oRows[j][oRowKeys[k]]));
					} else if (oRowKeys[k] === "Resale Price") {
						oDataObj["Resale_Price"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === '"List Price "') {
						oDataObj["List_Price"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Rebate Amount €") {
						oDataObj["Rebate_Amount"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Net Price") {
						oDataObj["Net_Price"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "Qty Sold to End User") {
						oDataObj["Quantity"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "UOM Sold") {
						oDataObj["UOM"] = oRows[j][oRowKeys[k]];
					} else if (oRowKeys[k] === "customer reference") {
						oDataObj["Customer_Reference"] = oRows[j][oRowKeys[k]];
					}
					oDataObj["col16"] = "";
					oDataObj["col17"] = "";
				}
				oDataToPost.push(oDataObj);
			}

			var oFinalPayload = {
				"file_name": "REBATE_CLAIM",
				"dummytoexcelset": oDataToPost,
				"dummytomessageset": []
			};

			return oFinalPayload;
		},

		onBlkSubmit: function () {
			var isValid = this.validateBlkPayload();
			if (isValid) {
				this.triggerRebateClmSubmit(true);
			} else {
				var oErrMsg = "";
				for (var i = 0; i < (this.oErrFlds).length; i++) {
					oErrMsg += "\n" + (i + 1) + ". " + this.oErrFlds[i];
				}
				MessageBox.error((this.oI18n).getText("VALIDATE_PAYLOAD_ERR") + ",\n" + oErrMsg);
			}
		},

		resetAttachMdl: function () {
			var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
			oAttachmentMdl.setProperty("/results", []);
			oAttachmentMdl.refresh(true);
		},

		onPostResponseOpen: function () {
			var oView = this.getView();
			var that = this;
			if (!this.byId("idPostResponseDlg")) {
				Fragment.load({
					id: oView.getId(),
					name: "ranpak.wz.rebatelist.fragment.postResponse",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					(that.oBusyDialog).close();
				});
			} else {
				this.byId("idPostResponseDlg").open();
				(this.oBusyDialog).close();
			}
		},

		onPostRespnsClose: function () {
			this.byId("idPostResponseDlg").close();
			if (this.oFileUploaded) {
				this.oFileUploaded = false;
				this.onFilterClear();
			}
		},

		hndlPostSuccess: function (oResponse) {
			var oDataObj = {};
			var oRebateID = oResponse.Rebate_ID;
			if (oRebateID.charAt(0) === ",") {
				oRebateID = oRebateID.substring(1);
			}
			var oRebateIDArr = oRebateID.split(",");

			oDataObj["message"] = "Rebate credit note " + oResponse.Message_Value + " has been submitted for processing";
			oDataObj["msgType"] = oResponse.Message_Type;
			oDataObj["creditNoteNum"] = oResponse.Message_Value;
			oDataObj["rebateID"] = oRebateIDArr;
			oDataObj["invoiceNum"] = oResponse.End_User_Invoice;
			oDataObj["shipDate"] = oResponse.End_User_Ship_Date;

			(this.oFinalMsgArr).push(oDataObj);
			var oPOSTResponseMdl = this.getOwnerComponent().getModel("oPOSTResponseMdl");
			oPOSTResponseMdl.setProperty("/results", this.oFinalMsgArr);
			oPOSTResponseMdl.refresh(true);
		},

		hndlPostErrWarn: function (oResponse) {
			var oDataObj = {};
			oDataObj["message"] = oResponse.Messages;
			oDataObj["msgType"] = oResponse.Message_Type;
			oDataObj["creditNoteNum"] = oResponse.Message_Value;
			oDataObj["rebateID"] = oResponse.Rebate_ID;
			oDataObj["invoiceNum"] = oResponse.End_User_Invoice;
			oDataObj["shipDate"] = oResponse.End_User_Ship_Date;

			(this.oFinalMsgArr).push(oDataObj);
			var oPOSTResponseMdl = this.getOwnerComponent().getModel("oPOSTResponseMdl");
			oPOSTResponseMdl.setProperty("/results", this.oFinalMsgArr);
			oPOSTResponseMdl.refresh(true);
		},

		formClmPayload: function () {
			var oDataToPost = [];
			var oRebateID = "", oStrLngth;
			for (var i = 0; i < (this.oClmSbmsnDt).length; i++) {
				oRebateID = "";
				oStrLngth = 10 - ((this.oClmSbmsnDt)[i].RebateID).length;
				for (var j = 0; j < oStrLngth; j++) {
					oRebateID += "0";
				}
				oRebateID += (this.oClmSbmsnDt)[i].RebateID;
				oDataToPost.push({
					"Rebate_ID": oRebateID,
					"Sales_Organization": "",
					"Distributor_No": (this.oClmSbmsnDt)[i].CustomerID,
					"Distributor_Name": (this.oClmSbmsnDt)[i].CustomerDescription,
					"End_User_No": (this.oClmSbmsnDt)[i].EndUserID,
					"End_user_Name": (this.oClmSbmsnDt)[i].EndUserDescription,
					"End_User_City": "",
					"End_user_State": "",
					"Your_Sales_Office": "",
					"Your_Sales_Office_Name": "",
					"Your_Item": "",
					"Your_Item_Description": "",
					"Ranpak_Item": (this.oClmSbmsnDt)[i].MaterialID,
					"End_User_Invoice": (this.oClmSbmsnDt)[i].End_User_Invoice,
					"End_User_Ship_Date": (this.oClmSbmsnDt)[i].End_User_Ship_Date,
					"col16": "",
					"col17": "",
					"Resale_Price": "",
					"List_Price": (this.oClmSbmsnDt)[i].ListPrice,
					"Rebate_Amount": (this.oClmSbmsnDt)[i].RebateAmount,
					"Net_Price": (this.oClmSbmsnDt)[i].NetPrice,
					"Quantity": (this.oClmSbmsnDt)[i].Quantity,
					"UOM": (this.oClmSbmsnDt)[i].Unit,
					"Customer_Reference": ""
				});
			};

			var oFinalPayload = {
				"file_name": "REBATE_CLAIM",
				"dummytoexcelset": oDataToPost,
				"dummytomessageset": []
			};

			return oFinalPayload;
		},

		triggerRebateClmSubmit: function (fromBlk) {
			(this.oBusyDialog).open();
			var that = this;
			var oFinalPayload = "";
			if (fromBlk) {
				oFinalPayload = this.formBlkClmPayload();
			} else {
				oFinalPayload = this.formClmPayload();
			}

			var oPOSTMdl = this.getOwnerComponent().getModel("oPOSTMdl");
			oPOSTMdl.create("/dummyheaderSet", oFinalPayload, {
				success: function (oEvent) {
					that.oFinalMsgArr = [];
					var oResponse = oEvent.dummytomessageset.results;
					var oResponseMsg = "", oResponseStatus = "", oFinalMsg = "", oRebateID = "", isStatusSuccess = 0;
					for (var j = 0; j < oResponse.length; j++) {
						oResponseStatus = oResponse[j].Message_Type;
						oResponseMsg = oResponse[j].Messages;

						if (oResponseStatus === "S") {
							isStatusSuccess = 1;
							that.hndlPostSuccess(oResponse[j]);
						} else if (oResponseStatus === "E" || oResponseStatus === "W") {
							that.hndlPostErrWarn(oResponse[j]);
						}
					}
					if (isStatusSuccess === 1) {
						that.upldDocToSharePoint(fromBlk, oFinalPayload);
					} else {
						that.onPostResponseOpen();
					}
				},
				error: function (oEvent) {
					(that.oBusyDialog).close();
					var oErrObj = JSON.parse(oEvent.responseText);
					MessageBox.error(oErrObj.error.message.value);
				}
			});
		},

		upldDocToSharePoint: function (fromBlk, oFinalPayload) {
			(this.oBusyDialog).open();
			var that = this;
			var oRebateClms = [], oDocs = [], oRebateIDArr = "";

			var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
			var oAttachmentMdlDt = oAttachmentMdl.getProperty("/results");
			for (var i = 0; i < oAttachmentMdlDt.length; i++) {
				oDocs.push({
					"name": oAttachmentMdlDt[i].fileName,
					"content": oAttachmentMdlDt[i].b64Content
				});
			}

			for (var i = 0; i < (this.oFinalMsgArr).length; i++) {
				if ((this.oFinalMsgArr)[i].msgType === "S") {
					oRebateClms.push({
						"rebateClaimNo": (this.oFinalMsgArr)[i].creditNoteNum,
						"docs": oDocs
					});
				}
			}

			var oPayload = {};
			if (fromBlk) {
				oPayload = {
					"customerId": (oFinalPayload).dummytoexcelset[0].Distributor_No,
					"customerName": (oFinalPayload).dummytoexcelset[0].Distributor_Name,
					"RebateClaims": oRebateClms
				};
			} else {
				oPayload = {
					"customerId": (this.oClmSbmsnDt)[0].CustomerID,
					"customerName": (this.oClmSbmsnDt)[0].CustomerDescription,
					"RebateClaims": oRebateClms
				};
			}

			var oSrvMdl = this.getOwnerComponent().getModel();
			oSrvMdl.create("/UploadDocuments", oPayload, {
				success: function (oEvent) {
					if (that.byId("idAttachmentDlg")) {
						that.byId("idAttachmentDlg").close();
					}
					if (that.byId("idBlkRbtClmDlg")) {
						that.byId("idBlkRbtClmDlg").close();
					}
					(that.oBusyDialog).close();
					that.oFileUploaded = true;
					that.onPostResponseOpen();
				},
				error: function (oEvent) {
					if (that.byId("idAttachmentDlg")) {
						that.byId("idAttachmentDlg").close();
					}
					(that.oBusyDialog).close();
					var oErrObj = JSON.parse(oEvent.responseText);
					var oErr = oErrObj.error.message.value + ". " + (that.oI18n).getText("TRY_AGAIN");
					MessageBox.error(oFinalMsg + "\n" + oErr);
				}
			});
		},

		onSuccInfoPress: function (oEvent) {
			var oCntxt = oEvent.getSource().getBindingContext("oPOSTResponseMdl").getObject();
			var oLclMdl = new JSONModel();
			oLclMdl.setProperty("/rebateID", oCntxt.rebateID);
			oLclMdl.refresh(true);

			var oSrc = oEvent.getSource();
			var oList = new sap.m.List();
			var oItemTemplate = new sap.m.StandardListItem({
				title: {
					path: "",
					formatter: function (oVal) {
						return oVal.replace(/^0+/, '');
					}
				}
			});
			oList.bindAggregation("items", "/rebateID", oItemTemplate);
			var oPopover = new sap.m.Popover({
				title: "for " + (this.oI18n).getText("columnRebateID"),
				content: [oList]
			});
			oPopover.setModel(oLclMdl);
			oPopover.openBy(oSrc);
		}
	});
});