sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("ranpak.wz.rebatelist.controller.BaseController", {
		fetchDate: function (oDate) {
			const itzOffset= oDate.getTimezoneOffset()*60000;
			const dAdustedDate= new Date(oDate.getTime()-itzOffset);

			return dAdustedDate
		}
	});
});