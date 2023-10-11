sap.ui.define([
    "ranpak/wz/rebatelist/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Token"
], function (BaseController, Filter, FilterOperator, Token) {
    "use strict";

    return BaseController.extend("ranpak.wz.rebatelist.controller.ListView", {
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            this._router = oComponent.getRouter();
            this._router.getRoute("ListView").attachPatternMatched(this._handleRouteMatched, this);
        },

        _handleRouteMatched: function (oEvent) {
            this.oI18n = this.getView().getModel("i18n").getResourceBundle();
            this.oFiltrKeys = ["RebateID", "ValidTo", "CustomerID", "EndUserID", "MaterialID", "Status"];

            const fnValidator = function (args) {
                const text = args.text;
                return new Token({ key: text, text: text });
            };
            this.byId("inputRebateID").addValidator(fnValidator);
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
            oFiltrBar.fireSearch();
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
        }
    });
});
