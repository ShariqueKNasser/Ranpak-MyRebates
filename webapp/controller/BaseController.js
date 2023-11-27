sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/format/NumberFormat",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, NumberFormat, MessageToast, MessageBox) {
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
			var oFinalVal = "";
			var oRegEx = /^\d{4}\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])$/;
			if (oRegEx.test(oVal)) {
				oFinalVal = oVal;
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
		}
	});
});