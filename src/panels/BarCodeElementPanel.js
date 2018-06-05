import StylePanel from './StylePanel';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import DocElement from '../elements/DocElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all barcode properties.
 * @class
 */
export default class BarCodeElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_bar_code_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_bar_code_element_content_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_content">${this.rb.getLabel('barCodeElementContent')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elContent = $(`<textarea id="rbro_bar_code_element_content" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_content', 'content',
                        elContent.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elContent);
        elFormField.append(elContent);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj), this.selectedObjId,
                        'rbro_bar_code_element_content', 'content', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_bar_code_element_content_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_bar_code_element_format_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_format">${this.rb.getLabel('barCodeElementFormat')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFormat = $(`<select id="rbro_bar_code_element_format" disabled="disabled">
                <option value="CODE128">CODE128</option>
            </select>`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_format',
                        'format', elFormat.val(), SetValueCmd.type.select, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elFormat);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_bar_code_element_display_value_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_display_value">${this.rb.getLabel('barCodeElementDisplayValue')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elDisplayValue = $(`<input id="rbro_bar_code_element_display_value" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_bar_code_element_display_value', 'displayValue',
                        elDisplayValue.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elDisplayValue);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_bar_code_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_position">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_bar_code_element_position_x">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('x') !== elPosX.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_position_x', 'x',
                        elPosX.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_bar_code_element_position_y">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('y') !== elPosY.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_bar_code_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_bar_code_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_size">${this.rb.getLabel('docElementHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elHeight = $(`<input id="rbro_bar_code_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_bar_code_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_bar_code_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_bar_code_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    $('#rbro_bar_code_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_bar_code_element_print_section').toggleClass('rbroHidden');
                    elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                    elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(elPrintHeader.position().top);
                    }
                    autosize.update($('#rbro_bar_code_element_print_if'));
                });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        panel.append(elDiv);

        let elPrintSectionDiv = $('<div id="rbro_bar_code_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_bar_code_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_bar_code_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_bar_code_element_print_if', 'printIf',
                        elPrintIf.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elPrintIf);
        elFormField.append(elPrintIf);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj), this.selectedObjId,
                        'rbro_bar_code_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_bar_code_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_bar_code_element_remove_empty_element">${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_bar_code_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_bar_code_element_remove_empty_element', 'removeEmptyElement',
                        elRemoveEmptyElement.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);

        if (this.rb.getProperty('enableSpreadsheet')) {
            let elSpreadsheetHeader = $('<div class="rbroPanelSectionHeader"></div>');
            let elSpreadsheetHeaderIcon = $('<span id="rbro_bar_code_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_bar_code_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        $('#rbro_bar_code_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                        $('#rbro_bar_code_element_spreadsheet_section').toggleClass('rbroHidden');
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

            let elSpreadsheetSectionDiv = $('<div id="rbro_bar_code_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_bar_code_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_bar_code_element_spreadsheet_hide">${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_bar_code_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_bar_code_element_spreadsheet_hide', 'spreadsheet_hide',
                            elSpreadsheetHide.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_bar_code_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_bar_code_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_bar_code_element_spreadsheet_column">`)
                .on('input', event => {
                    let obj = this.rb.getDataObject(this.selectedObjId);
                    if (obj !== null && obj.getValue('spreadsheet_column') !== elSpreadsheetColumn.val()) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_spreadsheet_column', 'spreadsheet_column',
                            elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_bar_code_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_bar_code_element_spreadsheet_colspan_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_bar_code_element_spreadsheet_colspan">${this.rb.getLabel('docElementSpreadsheetColspan')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColspan = $(`<input id="rbro_bar_code_element_spreadsheet_colspan">`)
                .on('input', event => {
                    let obj = this.rb.getDataObject(this.selectedObjId);
                    if (obj !== null && obj.getValue('spreadsheet_colspan') !== elSpreadsheetColspan.val()) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_bar_code_element_spreadsheet_colspan', 'spreadsheet_colspan',
                            elSpreadsheetColspan.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColspan);
            elFormField.append(elSpreadsheetColspan);
            elFormField.append('<div id="rbro_bar_code_element_spreadsheet_colspan_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_bar_code_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_bar_code_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_bar_code_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_bar_code_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
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
        autosize.update($('#rbro_bar_code_element_content'));
        autosize.update($('#rbro_bar_code_element_print_if'));
    }

    show(data) {
        this.updateData(data);
        $('#rbro_bar_code_element_panel').removeClass('rbroHidden');
        this.updateAutosizeInputs();
    }

    hide() {
        $('#rbro_bar_code_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {BarCodeElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_bar_code_element_content').prop('disabled', false);
            $('#rbro_bar_code_element_display_value').prop('disabled', false);
            $('#rbro_bar_code_element_position_x').prop('disabled', false);
            $('#rbro_bar_code_element_position_y').prop('disabled', false);
            $('#rbro_bar_code_element_width').prop('disabled', false);
            $('#rbro_bar_code_element_height').prop('disabled', false);
            $('#rbro_bar_code_element_print_if').prop('disabled', false);
            $('#rbro_bar_code_element_remove_empty_element').prop('disabled', false);
            $('#rbro_bar_code_element_spreadsheet_hide').prop('disabled', false);
            $('#rbro_bar_code_element_spreadsheet_column').prop('disabled', false);
            $('#rbro_bar_code_element_spreadsheet_colspan').prop('disabled', false);
            $('#rbro_bar_code_element_spreadsheet_add_empty_row').prop('disabled', false);

            $('#rbro_bar_code_element_content').val(data.getValue('content'));
            $('#rbro_bar_code_element_format').val(data.getValue('format'));
            $('#rbro_bar_code_element_display_value').prop('checked', data.getValue('displayValue'));
            $('#rbro_bar_code_element_position_x').val(data.getValue('x'));
            $('#rbro_bar_code_element_position_y').val(data.getValue('y'));
            $('#rbro_bar_code_element_width').val(data.getValue('width'));
            $('#rbro_bar_code_element_height').val(data.getValue('height'));
            $('#rbro_bar_code_element_print_if').val(data.getValue('printIf'));
            $('#rbro_bar_code_element_remove_empty_element').prop('checked', data.getValue('removeEmptyElement'));
            $('#rbro_bar_code_element_spreadsheet_hide').prop('checked', data.getValue('spreadsheet_hide'));
            $('#rbro_bar_code_element_spreadsheet_column').val(data.getValue('spreadsheet_column'));
            $('#rbro_bar_code_element_spreadsheet_colspan').val(data.getValue('spreadsheet_colspan'));
            $('#rbro_bar_code_element_spreadsheet_add_empty_row').prop('checked', data.getValue('spreadsheet_addEmptyRow'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_bar_code_element_content').prop('disabled', true);
            $('#rbro_bar_code_element_display_value').prop('disabled', true);
            $('#rbro_bar_code_element_position_x').prop('disabled', true);
            $('#rbro_bar_code_element_position_y').prop('disabled', true);
            $('#rbro_bar_code_element_width').prop('disabled', true);
            $('#rbro_bar_code_element_height').prop('disabled', true);
            $('#rbro_bar_code_element_print_if').prop('disabled', true);
            $('#rbro_bar_code_element_remove_empty_element').prop('disabled', true);
            $('#rbro_bar_code_element_spreadsheet_hide').prop('disabled', true);
            $('#rbro_bar_code_element_spreadsheet_column').prop('disabled', true);
            $('#rbro_bar_code_element_spreadsheet_colspan').prop('disabled', true);
            $('#rbro_bar_code_element_spreadsheet_add_empty_row').prop('disabled', true);
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
        $('#rbro_bar_code_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_bar_code_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_bar_code_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_bar_code_element_' + error.field + '_row';
                let errorId = 'rbro_bar_code_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'print_if') {
                    $('#rbro_bar_code_element_print_header').addClass('rbroError');
                    if (!$('#rbro_bar_code_element_print_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_bar_code_element_print_header').trigger('click');
                    }
                } else if (error.field === 'spreadsheet_column' || error.field === 'spreadsheet_colspan') {
                    $('#rbro_bar_code_element_spreadsheet_header').addClass('rbroError');
                    if (!$('#rbro_bar_code_element_spreadsheet_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_bar_code_element_spreadsheet_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
