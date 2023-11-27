sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
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
			var oRegEx = /^[a-zA-Z0-9]+$/;
			if (oRegEx.test(oVal)) {
				oRtrnVal = true;
			}

			return oRtrnVal;
		}
	});
});