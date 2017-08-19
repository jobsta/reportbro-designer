//
// Copyright (C) 2017 jobsta
//
// This file is part of ReportBro, a library to generate PDF and Excel reports.
// Demos can be found at https://reportbro.com.
//
// ReportBro is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// ReportBro is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//


import ReportBro from './ReportBro';

$.fn.reportBro = function(options) {
    var args = Array.prototype.slice.call(arguments, 1); // arguments for method call
    var ret = this; // function return value (this jQuery obj by default)

    this.each(function(i, _element) {
        var element = $(_element);
        var reportBro = element.data('reportBro');
        var currentResult;

        // method call
        if (typeof options === 'string') {
            if (reportBro && $.isFunction(reportBro[options])) {
                currentResult = reportBro[options].apply(reportBro, args);
                if (i === 0) {
                    ret = currentResult;
                }
                if (options === 'destroy') {
                    element.removeData('reportBro');
                }
            }
        }
        // new ReportBro instance
        else if (!reportBro) {
            reportBro = new ReportBro(element, options);
            element.data('reportBro', reportBro);
            reportBro.render();
            reportBro.setup();
        }
    });
    
    return ret;
};
