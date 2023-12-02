jQuery.sap.declare("ranpak.wz.rebatelist.model.formatter");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.require("sap.ui.core.format.DateFormat");

ranpak.wz.rebatelist.model.formatter = {
    formatDisplayIcon: function (oVal) {
        if (oVal === "E") {
            return "sap-icon://status-error";
        } else if (oVal === "W") {
            return "sap-icon://warning";
        } else if (oVal === "S") {
            return "sap-icon://message-success";
        }
    },

    formatDisplayIconClr: function (oVal) {
        if (oVal === "E") {
            return "#FF0000";
        } else if (oVal === "W") {
            return "#FFFF00";
        } else if (oVal === "S") {
            return "#276221";
        }
    },

    formatDisplayTitle: function (oStatus, oMsg) {
        var oFinalMsg = "";
        var oRebateID = "";
        if (oStatus === "E" || oStatus === "W") {
            oRebateID = this.getBindingContext("oPOSTResponseMdl").getObject().rebateID;
            oRebateID = oRebateID.replace(/^0+/, '');
            if (oMsg.split(":")[1]) {
                oFinalMsg = ((oMsg.split(":")[1]).trim()) + " for Rebate ID - " + oRebateID;
            } else {
                if (oRebateID) {
                    oFinalMsg = oMsg + " for Rebate ID - " + oRebateID;
                } else {
                    oFinalMsg = oMsg;
                }
            }
        } else if (oStatus === "S") {
            oFinalMsg = oMsg;
        }

        return oFinalMsg;
    },

    formatDisplayRebateIcn: function (oVal) {
        var oRtrnVal = false;
        if (oVal === "S") {
            return true;
        }

        return oRtrnVal;
    }
};