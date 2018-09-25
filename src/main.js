//
// Copyright (C) 2018 jobsta
//
// This file is part of ReportBro, a library to generate PDF and Excel reports.
// Demos can be found at https://www.reportbro.com
//
// Dual licensed under AGPLv3 and ReportBro commercial license:
// https://www.reportbro.com/license
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see https://www.gnu.org/licenses/
//
// Details for ReportBro commercial license can be found at
// https://www.reportbro.com/license/agreement
//


import ReportBro from './ReportBro';

$.fn.reportBro = function(options) {
    var args = Array.prototype.slice.call(arguments, 1); // arguments for method call
    var rv = null;

    this.each(function(i, _element) {
        var element = $(_element);
        var reportBro = element.data('reportBro');
        var currentResult;

        // method call
        if (typeof options === 'string') {
            if (reportBro && $.isFunction(reportBro[options])) {
                currentResult = reportBro[options].apply(reportBro, args);
                if (i === 0) {
                    rv = currentResult;
                }
                if (options === 'destroy') {
                    element.removeData('reportBro');
                }
            }
        } else {
            // new ReportBro instance
            if (!reportBro) {
                reportBro = new ReportBro(element, options);
                element.data('reportBro', reportBro);
                reportBro.render();
                reportBro.setup();
            }
            // return ReportBro instance
            rv = reportBro;
        }
    });
    
    return rv;
};
