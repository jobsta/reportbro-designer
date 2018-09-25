import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import DocElement from '../elements/DocElement';
import TableElement from '../elements/TableElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all table properties.
 * @class
 */
export default class TableElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_table_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div class="rbroFormRow" id="rbro_table_element_data_source_row"></div>');
        elDiv.append(`<label for="rbro_table_element_data_source">${this.rb.getLabel('docElementDataSource')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elDataSource = $(`<textarea id="rbro_table_element_data_source" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_data_source', 'dataSource',
                        elDataSource.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elDataSource);
        elFormField.append(elDataSource);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj, [Parameter.type.array]), this.selectedObjId,
                        'rbro_table_element_data_source', 'dataSource', PopupWindow.type.parameterSet);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_table_element_data_source_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_table_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_position">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_table_element_position_x">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_position_x', 'x',
                        elPosX.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_table_element_position_y">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_table_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_columns">${this.rb.getLabel('tableElementColumns')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColumns = $(`<input id="rbro_table_element_columns">`)
            .change(event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null) {
                    let val = utils.checkInputDecimal(elColumns.val(), 1, 20);
                    if (val !== elColumns.val()) {
                        elColumns.val(val);
                    }
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let columns = utils.convertInputToNumber(val);
                    let newColumns = obj.addCommandsForChangedColumns(columns, cmdGroup);
                    if (newColumns !== columns) {
                        elColumns.val(newColumns);
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                }
            });
        utils.setInputPositiveInteger(elColumns);
        elFormField.append(elColumns);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_header">${this.rb.getLabel('header')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHeaderLabel = $(`<label class="switch-light switch-material"></label>`);
        let elHeader = $(`<input id="rbro_table_element_header" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_header', 'header',
                        elHeader.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elHeaderLabel.append(elHeader);
        let elHeaderSpan = $('<span></span>');
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<a></a>'));
        elHeaderLabel.append(elHeaderSpan);
        elFormField.append(elHeaderLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_content_rows">${this.rb.getLabel('tableElementContentRows')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elContentRows = $(`<input id="rbro_table_element_content_rows" maxlength="1">`)
            .change(event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null) {
                    let val = utils.checkInputDecimal(elContentRows.val(), 1, 9);
                    if (val !== elContentRows.val()) {
                        elContentRows.val(val);
                    }
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let contentRows = utils.convertInputToNumber(val);
                    obj.addCommandsForChangedContentRows(contentRows, cmdGroup);
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                }
            });
        utils.setInputPositiveInteger(elContentRows);
        elFormField.append(elContentRows);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_footer">${this.rb.getLabel('footer')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFooterLabel = $(`<label class="switch-light switch-material"></label>`);
        let elFooter = $(`<input id="rbro_table_element_footer" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_footer', 'footer',
                        elFooter.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFooterLabel.append(elFooter);
        let elFooterSpan = $('<span></span>');
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<a></a>'));
        elFooterLabel.append(elFooterSpan);
        elFormField.append(elFooterLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label>${this.rb.getLabel('styleBorder')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorder = $('<div id="rbro_table_element_border"></div>');
        let elBorderGrid = $(`<button id="rbro_table_element_border_grid" class="rbroButton rbroActionButton rbroIcon-border-table-grid"
                type="button" value="grid"
                title="${this.rb.getLabel('tableElementBorderGrid')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border',
                        'border', TableElement.border.grid, SetValueCmd.type.buttonGroup, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorder.append(elBorderGrid);
        let elBorderFrameRow = $(`<button id="rbro_table_element_border_frame_row" class="rbroButton rbroActionButton rbroIcon-border-table-frame-row"
                type="button" value="frame_row"
                title="${this.rb.getLabel('tableElementBorderFrameRow')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border',
                        'border', TableElement.border.frameRow, SetValueCmd.type.buttonGroup, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorder.append(elBorderFrameRow);
        let elBorderFrame = $(`<button id="rbro_table_element_border_frame" class="rbroButton rbroActionButton rbroIcon-border-table-frame"
                type="button" value="frame"
                title="${this.rb.getLabel('tableElementBorderFrame')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border',
                        'border', TableElement.border.frame, SetValueCmd.type.buttonGroup, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorder.append(elBorderFrame);
        let elBorderRow = $(`<button id="rbro_table_element_border_row" class="rbroButton rbroActionButton rbroIcon-border-table-row"
                type="button" value="row"
                title="${this.rb.getLabel('tableElementBorderRow')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border',
                        'border', TableElement.border.row, SetValueCmd.type.buttonGroup, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorder.append(elBorderRow);
        let elBorderNone = $(`<button id="rbro_table_element_border_none" class="rbroButton rbroActionButton rbroIcon-border-table-none"
                type="button" value="none"
                title="${this.rb.getLabel('tableElementBorderNone')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border',
                        'border', TableElement.border.none, SetValueCmd.type.buttonGroup, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorder.append(elBorderNone);
        elFormField.append(elBorder);
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_border_color">${this.rb.getLabel('styleBorderColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBorderColor = $('<input id="rbro_table_element_border_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_border_color',
                        'borderColor', elBorderColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderColorContainer.append(elBorderColor);
        elFormField.append(elBorderColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elBorderColor, this.rb);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_element_border_width">${this.rb.getLabel('styleBorderWidth')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderWidth = $(`<input id="rbro_table_element_border_width">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(this.getSelectedObjId(), 'rbro_table_element_border_width',
                        'borderWidth', elBorderWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elBorderWidth);
        elDiv.append(elFormField);
        utils.setInputDecimal(elBorderWidth);
        panel.append(elDiv);

        if (this.rb.getProperty('enableSpreadsheet')) {
            let elSpreadsheetHeader = $('<div class="rbroPanelSectionHeader"></div>');
            let elSpreadsheetHeaderIcon = $('<span id="rbro_table_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_table_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        $('#rbro_table_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                        $('#rbro_table_element_spreadsheet_section').toggleClass('rbroHidden');
                        elSpreadsheetHeaderIcon.toggleClass('rbroIcon-plus');
                        elSpreadsheetHeaderIcon.toggleClass('rbroIcon-minus');
                        if (elSpreadsheetHeaderIcon.hasClass('rbroIcon-minus')) {
                            $('#rbro_detail_panel').scrollTop($('#rbro_detail_panel').scrollTop() + elSpreadsheetHeader.position().top);
                        }
                    }
                });
            elSpreadsheetHeader.append(elSpreadsheetHeaderIcon);
            elSpreadsheetHeader.append(`<span>${this.rb.getLabel('docElementSpreadsheet')}</span>`);
            elDiv.append(elSpreadsheetHeader);
            panel.append(elDiv);

            let elSpreadsheetSectionDiv = $('<div id="rbro_table_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_table_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_table_element_spreadsheet_hide">${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_table_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_table_element_spreadsheet_hide', 'spreadsheet_hide',
                            elSpreadsheetHide.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_table_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_table_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_table_element_spreadsheet_column">`)
                .on('input', event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_element_spreadsheet_column', 'spreadsheet_column',
                            elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_table_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_table_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_table_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_table_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_table_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
                            elSpreadsheetAddEmptyRow.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetAddEmptyRow);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);
            panel.append(elSpreadsheetSectionDiv);
        }

        $('#rbro_detail_panel').append(panel);
    }

    updateAutosizeInputs() {
        autosize.update($('#rbro_table_element_data_source'));
    }

    show(data) {
        $('#rbro_table_element_panel').removeClass('rbroHidden');
        this.updateData(data);
        this.updateAutosizeInputs();
    }

    hide() {
        $('#rbro_table_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {TableElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_table_element_data_source').prop('disabled', false);
            $('#rbro_table_element_position_x').prop('disabled', false);
            $('#rbro_table_element_position_y').prop('disabled', false);
            $('#rbro_table_element_columns').prop('disabled', false);
            $('#rbro_table_element_header').prop('disabled', false);
            $('#rbro_table_element_footer').prop('disabled', false);
            $('#rbro_table_element_border_grid').prop('disabled', false);
            $('#rbro_table_element_border_frame_row').prop('disabled', false);
            $('#rbro_table_element_border_frame').prop('disabled', false);
            $('#rbro_table_element_border_row').prop('disabled', false);
            $('#rbro_table_element_border_none').prop('disabled', false);
            $('#rbro_table_element_border_color').spectrum('enable');
            $('#rbro_table_element_border_width').prop('disabled', false);
            $('#rbro_table_element_spreadsheet_hide').prop('disabled', false);
            $('#rbro_table_element_spreadsheet_column').prop('disabled', false);
            $('#rbro_table_element_spreadsheet_add_empty_row').prop('disabled', false);

            $('#rbro_table_element_data_source').val(data.getValue('dataSource'));
            $('#rbro_table_element_position_x').val(data.getValue('x'));
            $('#rbro_table_element_position_y').val(data.getValue('y'));
            $('#rbro_table_element_columns').val(data.getValue('columns'));
            $('#rbro_table_element_header').prop('checked', data.getValue('header'));
            $('#rbro_table_element_content_rows').val(data.getValue('contentRows'));
            $('#rbro_table_element_footer').prop('checked', data.getValue('footer'));

            $('#rbro_table_element_border').find('button').removeClass('rbroButtonActive');
            $('#rbro_table_element_border').find(`button[value="${data.getValue('border')}"]`).addClass('rbroButtonActive');
            $('#rbro_table_element_border_color').spectrum('set', data.getValue('borderColor'));
            $('#rbro_table_element_border_width').val(data.getValue('borderWidth'));
            $('#rbro_table_element_spreadsheet_hide').prop('checked', data.getValue('spreadsheet_hide'));
            $('#rbro_table_element_spreadsheet_column').val(data.getValue('spreadsheet_column'));
            $('#rbro_table_element_spreadsheet_add_empty_row').prop('checked', data.getValue('spreadsheet_addEmptyRow'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_table_element_data_source').prop('disabled', true);
            $('#rbro_table_element_position_x').prop('disabled', true);
            $('#rbro_table_element_position_y').prop('disabled', true);
            $('#rbro_table_element_columns').prop('disabled', true);
            $('#rbro_table_element_header').prop('disabled', true);
            $('#rbro_table_element_content_rows').prop('disabled', true);
            $('#rbro_table_element_footer').prop('disabled', true);
            $('#rbro_table_element_border_grid').prop('disabled', true);
            $('#rbro_table_element_border_frame_row').prop('disabled', true);
            $('#rbro_table_element_border_frame').prop('disabled', true);
            $('#rbro_table_element_border_row').prop('disabled', true);
            $('#rbro_table_element_border_none').prop('disabled', true);
            $('#rbro_table_element_border_color').spectrum('disable');
            $('#rbro_table_element_border_width').prop('disabled', true);
            $('#rbro_table_element_spreadsheet_hide').prop('disabled', true);
            $('#rbro_table_element_spreadsheet_column').prop('disabled', true);
            $('#rbro_table_element_spreadsheet_add_empty_row').prop('disabled', true);
        }
        this.updateAutosizeInputs();
        this.updateErrors();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     */
    notifyEvent(obj, operation) {
    }

    /**
     * Updates displayed errors of currently selected data object.
     */
    updateErrors() {
        $('#rbro_table_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_table_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_table_element_' + error.field + '_row';
                let errorId = 'rbro_table_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'spreadsheet_column') {
                    $('#rbro_table_element_spreadsheet_header').addClass('rbroError');
                    if (!$('#rbro_table_element_spreadsheet_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_table_element_spreadsheet_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
