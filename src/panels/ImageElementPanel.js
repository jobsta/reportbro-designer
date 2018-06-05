import StylePanel from './StylePanel';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import DocElement from '../elements/DocElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all image properties.
 * @class
 */
export default class ImageElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_image_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_image_element_source_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_source">${this.rb.getLabel('imageElementSource')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elSource = $(`<textarea id="rbro_image_element_source" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_source', 'source',
                        elSource.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elSource);
        elFormField.append(elSource);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj,
                        [Parameter.type.image, Parameter.type.string]), this.selectedObjId,
                        'rbro_image_element_source', 'source', PopupWindow.type.parameterSet);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_image_element_source_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_image_element_image_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_image">${this.rb.getLabel('imageElementImage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elImage = $('<input id="rbro_image_element_image" type="file">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let files = event.target.files;
                    if (files && files[0]) {
                        let fileReader = new FileReader();
                        let rb = this.rb;
                        let fileName = files[0].name;
                        let objId = this.selectedObjId;
                        fileReader.onload = function(e) {
                            let cmdGroup = new CommandGroupCmd('Load image', this.rb);
                            let cmd = new SetValueCmd(objId, 'rbro_image_element_image', 'image',
                                e.target.result, SetValueCmd.type.file, rb);
                            cmdGroup.addCommand(cmd);
                            cmd = new SetValueCmd(objId, 'rbro_image_element_image_filename', 'imageFilename',
                                fileName, SetValueCmd.type.filename, rb);
                            cmdGroup.addCommand(cmd);
                            rb.executeCommand(cmdGroup);
                        };
                        fileReader.onerror = function(e) {
                            alert(this.rb.getLabel('imageElementLoadErrorMsg'));
                        };
                        fileReader.readAsDataURL(files[0]);
                    }
                }
            });
        elFormField.append(elImage);
        let elFilenameDiv = $('<div class="rbroSplit rbroHidden" id="rbro_image_element_image_filename_container"></div>');
        elFilenameDiv.append($('<div id="rbro_image_element_image_filename"></div>'));
        elFilenameDiv.append($('<div id="rbro_image_element_image_filename_clear" class="rbroIcon-cancel rbroButton rbroDeleteButton rbroRoundButton"></div>')
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    elImage.val('');
                    let cmdGroup = new CommandGroupCmd('Clear image', this.rb);
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_image', 'image',
                        '', SetValueCmd.type.file, this.rb);
                    cmdGroup.addCommand(cmd);
                    cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_image_filename', 'imageFilename',
                        '', SetValueCmd.type.filename, this.rb);
                    cmdGroup.addCommand(cmd);
                    this.rb.executeCommand(cmdGroup);
                }
            })
        );
        elFormField.append(elFilenameDiv);
        elFormField.append('<div id="rbro_image_element_image_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_image_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_position">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_image_element_position_x">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let val = utils.checkInputDecimal(elPosX.val(), 0, 1000);
                    if (val !== elPosX.val()) {
                        elPosX.val(val);
                    }
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_position_x', 'x',
                        val, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_image_element_position_y">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let val = utils.checkInputDecimal(elPosY.val(), 0, 1000);
                    if (val !== elPosY.val()) {
                        elPosY.val(val);
                    }
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_position_y', 'y',
                        val, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_image_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_image_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_size">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_image_element_width">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let val = utils.checkInputDecimal(elWidth.val(), 10, 1000);
                    if (val !== elWidth.val()) {
                        elWidth.val(val);
                    }
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_width', 'width',
                        val, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_image_element_height">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let val = utils.checkInputDecimal(elHeight.val(), 10, 1000);
                    if (val !== elHeight.val()) {
                        elHeight.val(val);
                    }
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_height', 'height',
                        val, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_image_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        let elStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elStyleHeaderIcon = $('<div id="rbro_image_element_style_header_icon" class="rbroPanelSectionHeaderOpen rbroIcon-minus"></div>');
        elDiv = $('<div id="rbro_image_element_style_header" class="rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen"></div>')
                .click(event => {
                    $('#rbro_image_element_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_image_element_style_section').toggleClass('rbroHidden');
                    elStyleHeaderIcon.toggleClass('rbroIcon-plus');
                    elStyleHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(elStyleHeader.position().top);
                    }
                });
        elStyleHeader.append(elStyleHeaderIcon);
        elStyleHeader.append(`<span>${this.rb.getLabel('docElementStyle')}</span>`);
        elDiv.append(elStyleHeader);
        panel.append(elDiv);

        let elStyleSectionDiv = $('<div id="rbro_image_element_style_section"></div>');
        StylePanel.renderStyle(elStyleSectionDiv, 'image_element_', '', DocElement.type.image, this, this.rb);
        panel.append(elStyleSectionDiv);

        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_image_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_image_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    $('#rbro_image_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_image_element_print_section').toggleClass('rbroHidden');
                    elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                    elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(elPrintHeader.position().top);
                    }
                    autosize.update($('#rbro_image_element_print_if'));
                });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        panel.append(elDiv);

        let elPrintSectionDiv = $('<div id="rbro_image_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_image_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_image_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_image_element_print_if', 'printIf',
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
                        'rbro_image_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_image_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_image_element_remove_empty_element">${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_image_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_image_element_remove_empty_element', 'removeEmptyElement',
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
            let elSpreadsheetHeaderIcon = $('<span id="rbro_image_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_image_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        $('#rbro_image_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                        $('#rbro_image_element_spreadsheet_section').toggleClass('rbroHidden');
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

            let elSpreadsheetSectionDiv = $('<div id="rbro_image_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_image_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_image_element_spreadsheet_hide">${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_image_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_image_element_spreadsheet_hide', 'spreadsheet_hide',
                            elSpreadsheetHide.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_image_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_image_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_image_element_spreadsheet_column">`)
                .on('input', event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_image_element_spreadsheet_column', 'spreadsheet_column',
                            elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_image_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_image_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_image_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_image_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_image_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
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
        autosize.update($('#rbro_image_element_source'));
        autosize.update($('#rbro_image_element_print_if'));
    }

    show(data) {
        $('#rbro_image_element_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_image_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {ImageElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_image_element_source').prop('disabled', false);
            $('#rbro_image_element_image').prop('disabled', false);
            $('#rbro_image_element_position_x').prop('disabled', false);
            $('#rbro_image_element_position_y').prop('disabled', false);
            $('#rbro_image_element_width').prop('disabled', false);
            $('#rbro_image_element_height').prop('disabled', false);
            $('#rbro_image_element_print_if').prop('disabled', false);
            $('#rbro_image_element_remove_empty_element').prop('disabled', false);
            $('#rbro_image_element_spreadsheet_hide').prop('disabled', false);
            $('#rbro_image_element_spreadsheet_column').prop('disabled', false);
            $('#rbro_image_element_spreadsheet_add_empty_row').prop('disabled', false);

            $('#rbro_image_element_source').val(data.getValue('source'));
            $('#rbro_image_element_image_filename').text(data.getValue('imageFilename'));
            if (data.getValue('imageFilename') !== '') {
                $('#rbro_image_element_image_filename_container').removeClass('rbroHidden');
            } else {
                $('#rbro_image_element_image_filename_container').addClass('rbroHidden');
            }
            $('#rbro_image_element_position_x').val(data.getValue('x'));
            $('#rbro_image_element_position_y').val(data.getValue('y'));
            $('#rbro_image_element_width').val(data.getValue('width'));
            $('#rbro_image_element_height').val(data.getValue('height'));
            $('#rbro_image_element_print_if').val(data.getValue('printIf'));
            $('#rbro_image_element_remove_empty_element').prop('checked', data.getValue('removeEmptyElement'));
            $('#rbro_image_element_spreadsheet_hide').prop('checked', data.getValue('spreadsheet_hide'));
            $('#rbro_image_element_spreadsheet_column').val(data.getValue('spreadsheet_column'));
            $('#rbro_image_element_spreadsheet_add_empty_row').prop('checked', data.getValue('spreadsheet_addEmptyRow'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_image_element_source').prop('disabled', true);
            $('#rbro_image_element_image_filename').text('');
            $('#rbro_image_element_image_filename_container').addClass('rbroHidden');
            $('#rbro_image_element_image').prop('disabled', true);
            $('#rbro_image_element_position_x').prop('disabled', true);
            $('#rbro_image_element_position_y').prop('disabled', true);
            $('#rbro_image_element_width').prop('disabled', true);
            $('#rbro_image_element_height').prop('disabled', true);
            $('#rbro_image_element_print_if').prop('disabled', true);
            $('#rbro_image_element_remove_empty_element').prop('disabled', true);
            $('#rbro_image_element_spreadsheet_hide').prop('disabled', true);
            $('#rbro_image_element_spreadsheet_column').prop('disabled', true);
            $('#rbro_image_element_spreadsheet_add_empty_row').prop('disabled', true);
        }
        $('#rbro_image_element_image').val('');
        StylePanel.updateStyleData(data, 'image_element_', '', DocElement.type.image);

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
        $('#rbro_image_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_image_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_image_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_image_element_' + error.field + '_row';
                let errorId = 'rbro_image_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'print_if') {
                    $('#rbro_image_element_print_header').addClass('rbroError');
                    if (!$('#rbro_image_element_print_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_image_element_print_header').trigger('click');
                    }
                } else if (error.field === 'spreadsheet_column') {
                    $('#rbro_image_element_spreadsheet_header').addClass('rbroError');
                    if (!$('#rbro_image_element_spreadsheet_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_image_element_spreadsheet_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
