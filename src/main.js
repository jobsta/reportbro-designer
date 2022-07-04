//
// Copyright (C) 2022 jobsta
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

(function(){
    if (typeof exports !== 'undefined') exports.ReportBro = ReportBro;
    else window.ReportBro = ReportBro;
})();
