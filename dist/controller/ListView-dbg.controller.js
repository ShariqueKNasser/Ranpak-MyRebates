sap.ui.define([
    "ranpak/wz/rebatelist/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/BusyDialog",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/m/DatePicker",
    "sap/m/Input",
    "sap/ui/core/format/NumberFormat"
], function (BaseController, Filter, FilterOperator, Token, MessageToast, MessageBox, Fragment, BusyDialog, Column, Text, DatePicker, Input, NumberFormat) {
    "use strict";

    return BaseController.extend("ranpak.wz.rebatelist.controller.ListView", {
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            this._router = oComponent.getRouter();
            this._router.getRoute("ListView").attachPatternMatched(this._handleRouteMatched, this);
        },

        _handleRouteMatched: function (oEvent) {
            this.oBusyDialog = new BusyDialog();
            this.oI18n = this.getView().getModel("i18n").getResourceBundle();
            this.oUserEditMdl = this.getOwnerComponent().getModel("oUserEditMdl");
            this.oBlkUpldMdl = this.getOwnerComponent().getModel("oBlkUpldMdl");
            this.oFiltrKeys = ["RebateID", "ValidTo", "CustomerID", "EndUserID", "MaterialID", "Status"];
            this.oClmSbmsnDt = [];

            this.resetAttachMdl();

            const fnValidator = function (args) {
                const text = args.text;
                return new Token({ key: text, text: text });
            };
            this.byId("inputRebateID").addValidator(fnValidator);

            //SET MAX AND MIN DATE FOR THE SHIP DATE
            var oCurrDt = new Date();
            var oPriorDate = new Date(new Date().setDate(oCurrDt.getDate() - 60));
            (this.oUserEditMdl).setProperty("/maxDate", new Date());
            (this.oUserEditMdl).setProperty("/minDate", oPriorDate);
        },

        onFilterClear: function (oEvent) {
            var oFiltrBar = this.getView().byId("idMyRebatesFB");
            var oFiltrCntrl = "";
            for (var i = 0; i < this.oFiltrKeys.length; i++) {
                oFiltrCntrl = oFiltrBar.getControlByKey(this.oFiltrKeys[i]);
                if (this.oFiltrKeys[i] === "RebateID") {
                    oFiltrCntrl.setTokens([]);
                } else if (this.oFiltrKeys[i] === "ValidTo") {
                    oFiltrCntrl.setValue(null);
                } else if (this.oFiltrKeys[i] === "Status") {
                    oFiltrCntrl.setSelectedKey(null);
                } else {
                    oFiltrCntrl.setSelectedKeys([]);
                }
            }

            var oMyRebatesPg = this.getView().byId("idMyRebatesPg");
            var oMyRebatesTbl = this.getView().byId("idMyRebatesTbl");
            var oSlctdItmList = oMyRebatesTbl.getTable().getSelectedItems();
            this.onTblMutliDSlct(oMyRebatesPg, oSlctdItmList);
            oFiltrBar.fireSearch();
            this.resetAttachMdl();
        },

        onBeforeRebindTbl: function (oEvent) {
            var oFiltrBar = this.getView().byId("idMyRebatesFB");
            var oBindingParam = oEvent.getParameter("bindingParams");
            var oSlctQuery = oBindingParam.parameters.select
            oSlctQuery += ",MaterialDescription,EndUserDescription,CustomerDescription,Currency";
            oBindingParam.parameters.select = oSlctQuery;

            var oSelctdFiltrs = oFiltrBar.getAllFiltersWithValues();
            for (var i = 0; i < oSelctdFiltrs.length; i++) {
                this.formFiltersForTable(oBindingParam, oFiltrBar, oSelctdFiltrs[i]);
            }

            //HASH Check
            const oHashChanger = new sap.ui.core.routing.HashChanger();
            let sHash = oHashChanger.getHash();
            if (sHash) {
                sHash = sHash.split("SearchString=")[1];

                if (!sHash) {
                    return;
                }
                const oFilter1 = new Filter("RebateID", FilterOperator.Contains, sHash);
                const oFilter2 = new Filter("CustomerDescription", FilterOperator.Contains, sHash);
                const oFilter3 = new Filter("CustomerID", FilterOperator.Contains, sHash);

                const aCombinedFilter = new Filter([oFilter1, oFilter2, oFilter3], false);
                oBindingParam.filters.push(aCombinedFilter);

                this.byId("inputRebateID").setTokens([new Token({ key: sHash, text: sHash })]);
            }
            //HASH Check
        },

        formFiltersForTable: function (oBindingParam, oFiltrBar, oSelctdFiltr) {
            var oFiltrKey = oSelctdFiltr.getName();
            var oFiltrControl = oFiltrBar.getControlByKey(oFiltrKey);
            var oFiltrVal = "",
                oFiltrToBeApplied = "";

            switch (oFiltrKey) {
                case "RebateID":
                    oFiltrVal = oFiltrControl.getTokens();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "RebateID", true);
                    break;
                case "CustomerID":
                    oFiltrVal = oFiltrControl.getSelectedKeys();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "CustomerID", true);
                    break;
                case "ValidTo":
                    oFiltrVal = oFiltrControl.getDateValue();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "ValidTo", false, oFiltrControl);
                    break;
                case "EndUserID":
                    oFiltrVal = oFiltrControl.getSelectedKeys();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "EndUserID", true);
                    break;
                case "MaterialID":
                    oFiltrVal = oFiltrControl.getSelectedKeys();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "MaterialID", true);
                    break;
                case "Status":
                    oFiltrVal = oFiltrControl.getSelectedKey();
                    oFiltrToBeApplied = this.formMultiFiltrMdl(oFiltrVal, "Status", false);
                    break;
                default:
                    break;
            }
            oBindingParam.filters.push(oFiltrToBeApplied);
        },

        formMultiFiltrMdl: function (oFiltrVal, oFiltrPath, isToken, oFiltrControl) {
            var oFilterArr = [],
                oFilter = "",
                oVal = "",
                oVal2 = "",
                oOperator = "EQ";

            if (isToken) {
                for (var i = 0; i < oFiltrVal.length; i++) {
                    if (oFiltrPath === "RebateID") {
                        oOperator = "EQ";
                        oVal = oFiltrVal[i].getText()
                    } else {
                        oVal = oFiltrVal[i].toUpperCase();
                    }
                }
            } else {
                if (oFiltrPath === "ValidTo") {
                    oOperator = "BT";
                    oVal = this.fetchDate(oFiltrControl.getDateValue());
                    oVal2 = new Date((oFiltrControl.getSecondDateValue()).getFullYear(), (oFiltrControl.getSecondDateValue()).getMonth() + 1, 0);
                    oVal2 = this.fetchDate(oVal2);
                } else if (oFiltrPath === "Status") {
                    oVal = oFiltrVal;
                }
            }
            oFilter = new Filter({
                path: oFiltrPath,
                operator: oOperator,
                value1: oVal,
                value2: oVal2
            });
            oFilterArr.push(oFilter);

            return (new Filter(oFilterArr));
        },

        onBeforeVariantFetch: function (oEvent) {
            var oSmtFilter = this.getView().byId("idMyRebatesFB");
            var oSlNoArr = [];

            var oSlNoFld = oSmtFilter.getControlByKey("RebateID").getTokens();
            for (var i = 0; i < oSlNoFld.length; i++) {
                oSlNoArr.push(oSlNoFld[i].getText());
            }

            oSmtFilter.setFilterData({
                _CUSTOM: {
                    RebateID: oSlNoArr,
                    ValidTo: oSmtFilter.getControlByKey("ValidTo").getValue(),
                    CustomerID: oSmtFilter.getControlByKey("CustomerID").getSelectedKeys(),
                    EndUserID: oSmtFilter.getControlByKey("EndUserID").getSelectedKeys(),
                    MaterialID: oSmtFilter.getControlByKey("MaterialID").getSelectedKeys(),
                    Status: oSmtFilter.getControlByKey("Status").getSelectedKey()
                }
            });
        },

        onVariantLoad: function (oEvent) {
            var oSmtFilter = this.getView().byId("idMyRebatesFB");
            var oSmtFilterData = oSmtFilter.getFilterData();
            var oCustomFieldData = oSmtFilterData["_CUSTOM"];

            var oSlNoTkn = [];
            for (var i = 0; i < (oCustomFieldData.RebateID).length; i++) {
                oSlNoTkn.push(new Token({
                    key: oCustomFieldData.RebateID[i],
                    text: oCustomFieldData.RebateID[i]
                }));
                oSmtFilter.getControlByKey("RebateID").setTokens(oSlNoTkn);
            }

            oSmtFilter.getControlByKey("CustomerID").setSelectedKeys(oCustomFieldData.CustomerID);
            oSmtFilter.getControlByKey("EndUserID").setSelectedKeys(oCustomFieldData.EndUserID);
            oSmtFilter.getControlByKey("MaterialID").setSelectedKeys(oCustomFieldData.MaterialID);
            oSmtFilter.getControlByKey("ValidTo").setValue(oCustomFieldData.ValidTo);
            oSmtFilter.getControlByKey("Status").setSelectedKey(oCustomFieldData.Status);
        },

        onMyRebatesExport: function (oEvent) {
            var oFileName = "";
            oFileName = "My_Rebates_" + new Date().toISOString();
            oEvent.getParameter("exportSettings").fileName = oFileName;
            this.formatExportList(oEvent);
        },

        formatExportList: function (oEvent) {
            var oWrkbk = oEvent.getParameter("exportSettings").workbook;
            var oWrkbkCols = oWrkbk.columns;
            oWrkbk.context = {
                "sheetName": "My Rebates"
            };

            for (var i = 0; i < oWrkbkCols.length; i++) {
                switch (oWrkbkCols[i].label) {
                    case (this.oI18n).getText("columnCustomer"):
                        oWrkbkCols[i].property = ["CustomerDescription", "CustomerID"];
                        oWrkbkCols[i].template = "{0} ({1})";
                        break;
                    case (this.oI18n).getText("columnRebateID"):
                        oWrkbkCols[i].property = "RebateID";
                        break;
                    case (this.oI18n).getText("columnEndUser"):
                        oWrkbkCols[i].property = ["EndUserDescription", "EndUserID"];
                        oWrkbkCols[i].template = "{0} ({1})";
                        break;
                    case (this.oI18n).getText("columnMaterial"):
                        oWrkbkCols[i].property = ["MaterialDescription", "MaterialID"];
                        oWrkbkCols[i].template = "{0} ({1})";
                        break;
                    case (this.oI18n).getText("columnUnit"):
                        oWrkbkCols[i].property = "Unit";
                        break;
                    case (this.oI18n).getText("columnListPrice"):
                        oWrkbkCols[i].property = "ListPrice";
                        break;
                    case (this.oI18n).getText("columnRebateAmount"):
                        oWrkbkCols[i].property = "RebateAmount";
                        break;
                    case (this.oI18n).getText("columnNetPrice"):
                        oWrkbkCols[i].property = "NetPrice";
                        break;
                    case (this.oI18n).getText("columnValidFrom"):
                        oWrkbkCols[i].type = sap.ui.export.EdmType.Date;
                        oWrkbkCols[i].property = "ValidFrom";
                        oWrkbkCols[i].format = "YYYY/MM/dd";
                        break;
                    case (this.oI18n).getText("columnValidTo"):
                        oWrkbkCols[i].type = sap.ui.export.EdmType.Date;
                        oWrkbkCols[i].property = "ValidTo";
                        oWrkbkCols[i].format = "YYYY/MM/dd";
                        break;
                    case (this.oI18n).getText("columnStatus"):
                        oWrkbkCols[i].property = "Status";
                        break;
                    case (this.oI18n).getText("columnEndUserPrice"):
                        oWrkbkCols[i].property = "EndUserPrice";
                        break;
                    default:
                        break;
                }
            }
        },

        GetStatusState: function (sStatus) {
            const oI18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            if (sStatus === oI18n.getText("filterStatusActive")) {
                return "Success";
            }
            if (sStatus === oI18n.getText("filterStatusExpired")) {
                return "Error";
            }
        },

        onTblMutliDSlct: function (oMyRebatesPg, oSlctdItmList, fromFilter) {
            var oSlctdItmListCells,
                oCellCustomDt;
            for (var j = 0; j < oSlctdItmList.length; j++) {
                oSlctdItmList[j].setSelected(false);
                oSlctdItmListCells = oSlctdItmList[j].getCells();
                for (var k = 0; k < oSlctdItmListCells.length; k++) {
                    oCellCustomDt = oSlctdItmListCells[k].getCustomData();
                    if (oCellCustomDt.length > 0) {
                        if (oCellCustomDt[0].getKey() === "INVOICE_NO" || oCellCustomDt[0].getKey() === "SHIP_DATE" || oCellCustomDt[0].getKey() === "QUANTITY_SOLD") {
                            oSlctdItmListCells[k].setVisible(false);
                            oSlctdItmListCells[k].setValue(null);
                        }
                    }
                }
            }
            oMyRebatesPg.setShowFooter(false);
            this.oClmSbmsnDt = [];
            (this.oUserEditMdl).setProperty("/claimSubmissionData", this.oClmSbmsnDt);
            (this.oUserEditMdl).refresh(true);
        },

        onTblItmSnglSlctn: function (oSlctdItm, oSlctdItmCells, oSlctdItmStatus, isItmSlctd, oMyRebatesTblSlctdItms, oMyRebatesPg) {
            var oCellCustomDt;
            if (oSlctdItmStatus === "Expired") {
                //ITEM WITH EXPIRED STATUS SHOULD NOT BE ALLOWED TO SELECT
                MessageToast.show((this.oI18n).getText("INVALID_ITEM_SELECT"));
                oSlctdItm.setSelected(false);
            } else {
                for (var i = 0; i < oSlctdItmCells.length; i++) {
                    oCellCustomDt = oSlctdItmCells[i].getCustomData();
                    if (oCellCustomDt.length > 0) {
                        if (oCellCustomDt[0].getKey() === "INVOICE_NO" || oCellCustomDt[0].getKey() === "SHIP_DATE" || oCellCustomDt[0].getKey() === "QUANTITY_SOLD") {
                            if (isItmSlctd) {
                                oSlctdItmCells[i].setVisible(true);
                            } else {
                                oSlctdItmCells[i].setVisible(false);
                            }
                        }
                    }
                }
                if (oMyRebatesTblSlctdItms.length === 0) {
                    oMyRebatesPg.setShowFooter(false);
                } else {
                    if (!oMyRebatesPg.getShowFooter()) {
                        oMyRebatesPg.setShowFooter(true);
                    }
                }
            }
        },

        onTblItmSlct: function (oEvent) {
            var oMyRebatesPg = this.getView().byId("idMyRebatesPg");
            var oSlctdItmList = oEvent.getParameter("listItems");

            //FOR TABLE MULTI DE-SELECT
            if (oSlctdItmList.length > 1) {
                this.onTblMutliDSlct(oMyRebatesPg, oSlctdItmList);
            } else {
                //FOR TABLE ITEM SINGLE SELECT/DE-SELECT
                var oMyRebatesTbl = this.getView().byId("idMyRebatesTbl");
                var oMyRebatesTblSlctdItms = oMyRebatesTbl.getTable().getSelectedItems();
                var oSlctdItm = oEvent.getParameter("listItem");
                var oSlctdItmCntxt = oSlctdItm.getBindingContext().getObject();
                var oSlctdItmStatus = oSlctdItmCntxt.Status;
                var oSlctdItmCells = oSlctdItm.getCells();
                var isItmSlctd = oEvent.getParameter("selected");

                this.onTblItmSnglSlctn(oSlctdItm, oSlctdItmCells, oSlctdItmStatus, isItmSlctd, oMyRebatesTblSlctdItms, oMyRebatesPg);
                this.formClmSubmsnDt(oSlctdItmCntxt, isItmSlctd);
            }
        },

        formClmSubmsnDt: function (oSlctdItmCntxt, isItmSlctd) {
            oSlctdItmCntxt.End_User_Invoice = "";
            oSlctdItmCntxt.End_User_Ship_Date = "";
            oSlctdItmCntxt.Quantity = "";

            if (isItmSlctd) {
                (this.oClmSbmsnDt).push(oSlctdItmCntxt);
            } else {
                for (var i = 0; i < (this.oClmSbmsnDt).length; i++) {
                    if (oSlctdItmCntxt.ID === (this.oClmSbmsnDt)[i].ID) {
                        (this.oClmSbmsnDt).splice(i);
                    }
                }
            }

            (this.oUserEditMdl).setProperty("/claimSubmissionData", this.oClmSbmsnDt);
            (this.oUserEditMdl).refresh(true);
        },

        onClmFldEdit: function (oEvent) {
            var oCrntFld = oEvent.getSource().getCustomData()[0].getKey();
            var oCntxt = oEvent.getSource().getBindingContext().getObject();

            for (var i = 0; i < (this.oClmSbmsnDt).length; i++) {
                if (oCntxt.ID === (this.oClmSbmsnDt)[i].ID) {
                    if (oCrntFld === "INVOICE_NO") {
                        var isValidInvoiceNo = this.validateAlphaNumFld(oEvent);
                        if (isValidInvoiceNo) {
                            oEvent.getSource().setValueState("None");
                            (this.oClmSbmsnDt)[i].End_User_Invoice = oEvent.getSource().getValue();
                        } else {
                            MessageToast.show((this.oI18n).getText("INVALID_ENTRY"));
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValue(null);
                        }
                    } else if (oCrntFld === "SHIP_DATE") {
                        (this.oClmSbmsnDt)[i].End_User_Ship_Date = oEvent.getSource().getValue();
                    } else if (oCrntFld === "QUANTITY_SOLD") {
                        var isValidQtySld = this.validateNumberFld(oEvent);
                        if (isValidQtySld) {
                            oEvent.getSource().setValueState("None");
                            (this.oClmSbmsnDt)[i].Quantity = oEvent.getSource().getValue();
                        } else {
                            MessageToast.show((this.oI18n).getText("INVALID_ENTRY"));
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValue(null);
                        }
                    }
                }
            }
            (this.oUserEditMdl).setProperty("/claimSubmissionData", this.oClmSbmsnDt);
            (this.oUserEditMdl).refresh(true);
        },

        validatePayload: function () {
            var oRtrnVal = 1;

            //VALIDATE FIELDS
            var oMyRebatesTbl = this.getView().byId("idMyRebatesTbl");
            var oSlctdItems = oMyRebatesTbl.getTable().getSelectedItems();
            var oSlctdListCells, oSlctCntrlCstmDt, oSlctCntrlCstmDtKey;
            for (var i = 0; i < oSlctdItems.length; i++) {
                oSlctdListCells = oSlctdItems[i].getCells();
                for (var j = 0; j < oSlctdListCells.length; j++) {
                    oSlctCntrlCstmDt = oSlctdListCells[j].getCustomData();
                    if (oSlctCntrlCstmDt.length > 0) {
                        oSlctCntrlCstmDtKey = oSlctCntrlCstmDt[0].getKey();
                        if (oSlctCntrlCstmDtKey === "INVOICE_NO" || oSlctCntrlCstmDtKey === "SHIP_DATE" || oSlctCntrlCstmDtKey === "QUANTITY_SOLD") {
                            if (!oSlctdListCells[j].getValue()) {
                                oSlctdListCells[j].setValueState("Error");
                                oRtrnVal = 0;
                            } else {
                                oSlctdListCells[j].setValueState("None");
                            }
                        }
                    }
                }
            }

            //MANDATORY SUPPORTING DOCUMENTS
            if (oRtrnVal === 1) {
                (this.oBusyDialog).open();
                oRtrnVal = 2;
                var oView = this.getView();
                var that = this;
                var oSubmitWithDocBtn = this.getView().byId("idSubmitWithDocBtn");
                if (!this.byId("idAttachmentDlg")) {
                    Fragment.load({
                        id: oView.getId(),
                        name: "ranpak.wz.rebatelist.fragment.attachmentDlg",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        oDialog.open();
                        oView.byId("idMyRebatesPg").setShowFooter(false);
                        that.resetAttachMdl();
                        if (oSubmitWithDocBtn) {
                            oSubmitWithDocBtn.setEnabled(false);
                        }
                        (that.oBusyDialog).close();
                    });
                } else {
                    this.byId("idAttachmentDlg").open();
                    this.byId("idMyRebatesPg").setShowFooter(false);
                    this.resetAttachMdl();
                    if (oSubmitWithDocBtn) {
                        oSubmitWithDocBtn.setEnabled(false);
                    }
                    (this.oBusyDialog).close();
                }
            }

            return oRtrnVal;
        },

        onAttachmentUpload: function (oEvent) {
            var oUploadedFiles = oEvent.getSource().oFileUpload.files;
            var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
            var oAttachmentsMdlDt = oAttachmentMdl.getProperty("/results");
            this.formAttachments(oUploadedFiles, oAttachmentMdl, oAttachmentsMdlDt);
        },

        formAttachments: function (oUploadedFiles, oAttachmentMdl, oAttachmentsMdlDt) {
            var oFileName = "",
                oFileSize = "",
                oFileSizeBytes = "",
                oType = "",
                oDocCount = 0;
            for (var i = 0; i < oUploadedFiles.length; i++) {
                oFileName = oUploadedFiles[i].name;
                oFileSizeBytes = (oUploadedFiles[i].size);
                oFileSize = (oUploadedFiles[i].size) / (1024 * 1024);
                oFileSize = parseFloat(oFileSize.toFixed(2));
                oType = oFileName.substring(oFileName.lastIndexOf('.') + 1, oFileName.length) || oFileName;
                oType = oType.toUpperCase();
                if (oType === "XLSX" || oType === "XLS" || oType === "CSV" || oType === "PNG" || oType === "JPEG" || oType === "JPG" || oType ===
                    "PDF" || oType === "DOCX" || oType === "DOC" || oType === "TXT" || oType === "PPTX" || oType === "PPT" ||
                    oType === "MSG" || oType === "EML") {
                    for (var j = 0; j < oAttachmentsMdlDt.length; j++) {
                        oDocCount += oAttachmentsMdlDt[j].FilesizeMB;
                    }
                    oDocCount += oFileSize;
                    if (oDocCount > 50) {
                        MessageToast.show((this.oI18n).getResourceBundle().getText("DOC_SIZE_ERROR"));
                    } else {
                        this.updateAttachmentsModel(oUploadedFiles[i], oAttachmentMdl, oAttachmentsMdlDt, oFileName, oFileSizeBytes, oFileSize,
                            oType);
                    }
                } else {
                    MessageToast.show((this.oI18n).getResourceBundle().getText("SUPPORTED_DOC"));
                }
            }
        },

        updateAttachmentsModel: function (oUploadedFiles, oAttachmentMdl, oAttachmentsMdlDt, oFileName, oFileSizeBytes, oFileSize,
            oFileType) {
            var oSubmitWithDocBtn = this.getView().byId("idSubmitWithDocBtn");
            var oBlkSubmitBtn = this.getView().byId("idBlkSubmitBtn");
            var reader = new FileReader();
            reader.readAsDataURL(oUploadedFiles);
            reader.onloadend = function (evt) {
                if (evt.target.readyState === FileReader.DONE) {
                    var s = evt.target.result;
                    var base64 = s.split(",")[1];
                    oAttachmentsMdlDt.push({
                        "b64Content": base64,
                        "fileName": oFileName,
                        "fileSizeBytes": oFileSizeBytes,
                        "fileSize": oFileSize + " MB",
                        "fileType": oFileType
                    });
                    oAttachmentMdl.refresh(true);
                    if (oSubmitWithDocBtn) {
                        oSubmitWithDocBtn.setEnabled(true);
                    }
                    if (oBlkSubmitBtn) {
                        oBlkSubmitBtn.setEnabled(true);
                    }
                }
            };
        },

        onSubmitClm: function () {
            var isValid = this.validatePayload();
            if (isValid === 0) {
                MessageBox.error((this.oI18n).getText("VALIDATE_PAYLOAD_ERR"));
            }
        },

        onAttachmentDel: function (oEvent) {
            var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
            var oAttachmentMdlDt = oAttachmentMdl.getProperty("/results");
            var oCntxt = oEvent.getSource().getBindingContext("oAttachmentMdl");
            var oCntxtPath = oCntxt.getPath().split("/")[2];

            oAttachmentMdlDt.splice(oCntxtPath, 1);
            oAttachmentMdl.refresh(true);

            if (oAttachmentMdlDt.length === 0) {
                if (this.byId("idSubmitWithDocBtn")) {
                    this.byId("idSubmitWithDocBtn").setEnabled(false);
                }
                if (this.byId("idBlkSubmitBtn")) {
                    this.byId("idBlkSubmitBtn").setEnabled(false);
                }
            }
        },

        onSubmitClmWithDoc: function () {
            this.triggerRebateClmSubmit();
        },

        formClmPayload: function () {
            var oDataToPost = [];
            var oRebateID = "", oStrLngth;
            for (var i = 0; i < (this.oClmSbmsnDt).length; i++) {
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
                    var oResponse = oEvent.dummytomessageset.results;
                    var oResponseMsg = "", oResponseStatus = "", oFinalMsg = "", oRebateID = "", isStatusSuccess = 0;
                    for (var j = 0; j < oResponse.length; j++) {
                        oResponseStatus = oResponse[j].Message_Type;
                        oResponseMsg = oResponse[j].Messages;

                        if (oResponse.length === that.oClmSbmsnDt.length) {
                            oRebateID = that.oClmSbmsnDt[j].RebateID;
                            if (oResponseStatus === "E" || oResponseStatus === "W") {
                                if (oResponseMsg) {
                                    oResponseMsg = oResponseMsg.split(":")[1];
                                }
                                oFinalMsg += "\nRebate ID " + oRebateID + " : " + oResponseMsg;
                            } else if (oResponseStatus === "S") {
                                isStatusSuccess = 1;
                                oFinalMsg += oResponseMsg;
                                that.upldDocToSharePoint(oFinalMsg, fromBlk, oFinalPayload);
                            }
                        } else {
                            if (oResponseStatus === "E" || oResponseStatus === "W") {
                                oFinalMsg += "\n" + oResponseMsg;
                            } else if (oResponseStatus === "S") {
                                isStatusSuccess = 1;
                                oFinalMsg += "\n" + oResponseMsg;
                                that.upldDocToSharePoint(oFinalMsg, fromBlk, oFinalPayload);
                            }
                        }
                    }
                    if (isStatusSuccess === 0) {
                        MessageBox.error(oFinalMsg);
                        (that.oBusyDialog).close();
                    }
                },
                error: function (oEvent) {
                    (that.oBusyDialog).close();
                    var oErrObj = JSON.parse(oEvent.responseText);
                    MessageBox.error(oErrObj.error.message.value);
                }
            });
        },

        onClmWithDocCncl: function () {
            this.resetAttachMdl();
            this.byId("idAttachmentDlg").close();
            this.byId("idMyRebatesPg").setShowFooter(true);
        },

        upldDocToSharePoint: function (oFinalMsg, fromBlk, oFinalPayload) {
            (this.oBusyDialog).open();
            var that = this;
            var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
            var oAttachmentMdlDt = oAttachmentMdl.getProperty("/results");
            var oDocs = [];
            for (var i = 0; i < oAttachmentMdlDt.length; i++) {
                oDocs.push({
                    "name": oAttachmentMdlDt[i].fileName,
                    "content": oAttachmentMdlDt[i].b64Content
                });
            }

            var oPayload = {};
            var oCreditNote = "";
            oCreditNote = oFinalMsg.match(/(\d+)/)[0];
            if (fromBlk) {
                oPayload = {
                    "customerId": (oFinalPayload).dummytoexcelset[0].Distributor_No,
                    "customerName": (oFinalPayload).dummytoexcelset[0].Distributor_Name,
                    "rebateClaimNo": oCreditNote,
                    "docs": oDocs
                };
            } else {
                oPayload = {
                    "customerId": (this.oClmSbmsnDt)[0].CustomerID,
                    "customerName": (this.oClmSbmsnDt)[0].CustomerDescription,
                    "rebateClaimNo": oCreditNote,
                    "docs": oDocs
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
                    MessageBox.success(oFinalMsg + "\n" + "Supporting documents uploaded successfully", {
                        onClose: function () {
                            that.onFilterClear();
                        }
                    });
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

        onBulkBtnPress: function () {
            (this.oBusyDialog).open();
            var oView = this.getView();
            var that = this;
            if (!this.byId("idBlkRbtClmDlg")) {
                Fragment.load({
                    id: oView.getId(),
                    name: "ranpak.wz.rebatelist.fragment.bulkRebateClaimWizard",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    oDialog.open();
                    that.oBlkRbtClmWiz = oView.byId("idBlkRbtClmWiz");
                    that.idDwnldTmpltWizStp = oView.byId("idDwnldTmpltWizStp");
                    that.oUpldTmpltWizStp = oView.byId("idUpldTmpltWizStp");
                    that.oReviewWizStp = oView.byId("idReviewWizStp");
                    that.oAttachUpldWizStp = oView.byId("idAttachUpldWizStp");
                    var oMyRebatesPg = oView.byId("idMyRebatesPg");
                    var oMyRebatesTbl = oView.byId("idMyRebatesTbl");
                    var oSlctdItmList = oMyRebatesTbl.getTable().getSelectedItems();
                    that.onTblMutliDSlct(oMyRebatesPg, oSlctdItmList);
                    that.resetBlkClmWiz();
                    (that.oBusyDialog).close();
                });
            } else {
                this.byId("idBlkRbtClmDlg").open();
                var oMyRebatesPg = oView.byId("idMyRebatesPg");
                var oMyRebatesTbl = oView.byId("idMyRebatesTbl");
                var oSlctdItmList = oMyRebatesTbl.getTable().getSelectedItems();
                this.onTblMutliDSlct(oMyRebatesPg, oSlctdItmList);
                this.resetBlkClmWiz();
                (this.oBusyDialog).close();
            }
        },

        resetBlkClmWiz: function () {
            (this.oBlkRbtClmWiz).setCurrentStep(this.idDwnldTmpltWizStp);
            var oBlkSubmitBtn = this.getView().byId("idBlkSubmitBtn");
            oBlkSubmitBtn.setEnabled(false);
            this.resetAttachMdl();
        },

        onBlkCncl: function () {
            this.resetBlkClmWiz();
            this.byId("idBlkRbtClmDlg").close();
        },

        onDwnldTemplt: function () {
            var oPath = this.getAppModulePath() + "/artifacts/Rebate-Claim-Template.xlsx";
            sap.m.URLHelper.redirect(oPath, true);

            (this.oBlkRbtClmWiz).setCurrentStep(this.oUpldTmpltWizStp);
        },

        onUpldTemplt: function (oEvent) {
            (this.oBusyDialog).open();
            var oUploadedFile = oEvent.getSource().oFileUpload.files[0];
            this.resetAttachMdl();
            var oBlkSubmitBtn = this.getView().byId("idBlkSubmitBtn");
            oBlkSubmitBtn.setEnabled(false);
            this.oParseExcel(oUploadedFile);
        },

        oParseExcel: function (oUploadedFile) {
            var that = this;
            var oExcelDt = {},
                oWS = "";
            if (oUploadedFile && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: "binary"
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        oWS = workbook.Sheets[sheetName];
                        oExcelDt = XLSX.utils.sheet_to_row_object_array(oWS);
                    });

                    if (oExcelDt.length > 0) {
                        that.setExcelDtToTbl(oWS, oExcelDt);
                        that.generateTable();
                        (that.oBlkRbtClmWiz).setCurrentStep(that.oReviewWizStp);
                        (that.oBlkRbtClmWiz).setCurrentStep(that.oAttachUpldWizStp);
                        that.upldTmpltToAttachMdl(oUploadedFile);
                    } else {
                        MessageBox.error((that.oI18n).getText("UPLOAD_FILE_EMPTY"));
                        (that.oBlkRbtClmWiz).setCurrentStep(that.oUpldTmpltWizStp);
                        (that.oBusyDialog).close();
                    }
                };
                reader.readAsBinaryString(oUploadedFile);
            }
        },

        upldTmpltToAttachMdl: function (oUploadedFile) {
            var that = this;
            var oFileName, oFileSizeBytes, oFileSize, oFileType;
            oFileName = oUploadedFile.name;
            oFileSizeBytes = oUploadedFile.size;
            oFileSize = (oUploadedFile.size) / (1024 * 1024);
            oFileSize = parseFloat(oFileSize.toFixed(2));
            oFileType = oFileName.substring(oFileName.lastIndexOf('.') + 1, oFileName.length) || oFileName;
            oFileType = oFileType.toUpperCase();
            var oAttachmentMdl = this.getOwnerComponent().getModel("oAttachmentMdl");
            var oAttachmentsMdlDt = oAttachmentMdl.getProperty("/results");
            var reader = new FileReader();
            reader.readAsDataURL(oUploadedFile);
            reader.onloadend = function (evt) {
                if (evt.target.readyState === FileReader.DONE) {
                    var s = evt.target.result;
                    var base64 = s.split(",")[1];
                    oAttachmentsMdlDt.push({
                        "b64Content": base64,
                        "fileName": oFileName,
                        "fileSizeBytes": oFileSizeBytes,
                        "fileSize": oFileSize + " MB",
                        "fileType": oFileType
                    });
                    oAttachmentMdl.refresh(true);
                    (that.oBusyDialog).close();
                }
            };
        },

        setExcelDtToTbl: function (oWS, oExcelDt) {
            const oTBlHdr = []
            const columnCount = XLSX.utils.decode_range(oWS['!ref']).e.c + 1
            for (let i = 0; i < columnCount; ++i) {
                if (oWS[XLSX.utils.encode_col(i) + 1]) {
                    oTBlHdr[i] = oWS[XLSX.utils.encode_col(i) + 1].v;
                }
            }
            this.oBlkUpldMdl.setProperty("/columns", oTBlHdr);
            this.oBlkUpldMdl.setProperty("/rows", oExcelDt);
        },

        generateTblTmplt: function (columnName) {
            var that = this;
            var oUICntrl = "";
            var oCurrDt = new Date();
            var oPriorDate = new Date(new Date().setDate(oCurrDt.getDate() - 60));
            if (columnName) {
                if ((columnName.toUpperCase()).indexOf("DATE") !== -1) {
                    oUICntrl = new DatePicker({
                        "value": {
                            path: "oBlkUpldMdl>" + columnName,
                            formatter: this.validateDateFldBlk
                        },
                        "displayFormat": "YYYY/MM/dd",
                        "valueFormat": "YYYY-MM-dd",
                        change: function (oEvent) {
                            this.setValueState("None");
                            if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                                oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oEvent.getSource().getValue();
                            }
                        },
                        maxDate: oCurrDt,
                        minDate: oPriorDate
                    });
                    return oUICntrl;
                } else if ((columnName.toUpperCase()).indexOf("#") !== -1 || (columnName.toUpperCase()).indexOf("NUMBER") !== -1) {
                    oUICntrl = new Input({
                        "value": {
                            path: "oBlkUpldMdl>" + columnName,
                            formatter: this.validateAlphaNumFldBlk
                        },
                        change: function (oEvent) {
                            var isValid = that.validateAlphaNumFld(oEvent);
                            if (isValid) {
                                oEvent.getSource().setValueState("None");
                            } else {
                                oEvent.getSource().setValueState("Error");
                                oEvent.getSource().setValue(null);
                            }

                            if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                                oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oEvent.getSource().getValue();
                            }
                        }
                    });
                    return oUICntrl;
                } else if ((columnName.toUpperCase()).indexOf("AMOUNT") !== -1 || (columnName.toUpperCase()).indexOf("PRICE") !== -1) {
                    oUICntrl = new Input({
                        "value": {
                            path: "oBlkUpldMdl>" + columnName,
                            formatter: this.validateAmntFldBlk
                        },
                        change: function (oEvent) {
                            var oVal = oEvent.getSource().getValue();
                            var oAmountFormat = NumberFormat.getCurrencyInstance({
                                "currencyCode": false,
                                "decimals": 2
                            });
                            var isValid = that.validateNumberFld(oEvent);
                            if (isValid) {
                                oEvent.getSource().setValueState("None");
                                oEvent.getSource().setValue(oAmountFormat.format(oVal));
                            } else {
                                oEvent.getSource().setValueState("Error");
                                oEvent.getSource().setValue(null);
                            }

                            if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                                oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oEvent.getSource().getValue();
                            }
                        }
                    });
                    return oUICntrl;
                } else if ((columnName.toUpperCase()).indexOf("NAME") !== -1) {
                    oUICntrl = new Input({
                        "value": {
                            path: "oBlkUpldMdl>" + columnName
                        },
                        change: function (oEvent) {
                            var oVal = oEvent.getSource().getValue();
                            if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                                oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oVal;
                            }
                        }
                    });
                    return oUICntrl;
                } else {
                    oUICntrl = new Input({
                        "value": {
                            path: "oBlkUpldMdl>" + columnName,
                            formatter: this.validateAlphaNumFldBlk
                        },
                        change: function (oEvent) {
                            var isValid = that.validateAlphaNumFld(oEvent);
                            if (isValid) {
                                oEvent.getSource().setValueState("None");
                            } else {
                                oEvent.getSource().setValueState("Error");
                                oEvent.getSource().setValue(null);
                            }

                            if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                                oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oEvent.getSource().getValue();
                            }
                        }
                    });
                    return oUICntrl;
                }
            } else {
                oUICntrl = new Input({
                    "value": {
                        path: "oBlkUpldMdl>" + columnName,
                        formatter: this.validateAlphaNumFldBlk
                    },
                    change: function (oEvent) {
                        var isValid = that.validateAlphaNumFld(oEvent);
                        if (isValid) {
                            oEvent.getSource().setValueState("None");
                        } else {
                            oEvent.getSource().setValueState("Error");
                            oEvent.getSource().setValue(null);
                        }

                        if (oEvent.getSource().getBindingContext("oBlkUpldMdl")) {
                            oEvent.getSource().getBindingContext("oBlkUpldMdl").getObject()[oEvent.getSource().getBindingInfo("value").parts[0].path] = oEvent.getSource().getValue();
                        }
                    }
                });
                return oUICntrl;
            }
        },

        generateTable: function () {
            var that = this;
            var oBlkUpldTbl = this.getView().byId("idBlkUpldTbl");
            oBlkUpldTbl.bindColumns("oBlkUpldMdl>/columns", function (sId, oContext) {
                var columnName = oContext.getObject();
                if (columnName && columnName.indexOf("/") !== -1) {
                    columnName = columnName.split("/")[0];
                }
                var oTmplt = that.generateTblTmplt(columnName);
                return new Column({
                    label: columnName,
                    template: oTmplt,
                    width: "12rem",
                    tooltip: columnName,
                    sortProperty: columnName,
                    filterProperty: columnName
                });
            });
            oBlkUpldTbl.bindRows("oBlkUpldMdl>/rows");
        }
    });
});