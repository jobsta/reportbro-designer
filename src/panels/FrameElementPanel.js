import SetValueCmd from '../commands/SetValueCmd';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all frame properties.
 * @class
 */
export default class FrameElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_frame_element_panel" class="rbroHidden"></div>');

        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_label">${this.rb.getLabel('docElementLabel')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elLabel = $(`<input id="rbro_frame_element_label">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(this.getSelectedObjId(), 'rbro_frame_element_label',
                        'label', elLabel.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div id="rbro_frame_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_position_x">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_frame_element_position_x">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('x') !== elPosX.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_position_x', 'x',
                        elPosX.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_frame_element_position_y">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('y') !== elPosY.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_frame_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_frame_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_width">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_frame_element_width">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('width') !== elWidth.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_width', 'width',
                        elWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_frame_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_frame_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_background_color">${this.rb.getLabel('styleBackgroundColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBgColor = $('<input id="rbro_frame_element_background_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_background_color',
                        'backgroundColor', elBgColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBgColorContainer.append(elBgColor);
        elFormField.append(elBgColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elBgColor, this.rb, { allowEmpty: true });

        let elBorderDiv = $(`<div id="rbro_frame_element_border_div"></div>`);
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label>${this.rb.getLabel('styleBorder')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderStyle = $('<div id="rbro_frame_element_border"></div>');
        let elBorderAll = $(`<button id="rbro_frame_element_border_all"
                class="rbroButton rbroActionButton rbroIcon-border-all"
                type="button" value="borderAll"
                title="${this.rb.getLabel('styleBorderAll')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_all',
                        'borderAll', !elBorderAll.hasClass('rbroButtonActive'),
                        SetValueCmd.type.button, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderStyle.append(elBorderAll);
        let elBorderLeft = $(`<button id="rbro_frame_element_border_left"
                class="rbroButton rbroActionButton rbroIcon-border-left"
                type="button" value="borderLeft"
                title="${this.rb.getLabel('orientationLeft')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_left',
                        'borderLeft', !elBorderLeft.hasClass('rbroButtonActive'),
                        SetValueCmd.type.button, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderStyle.append(elBorderLeft);
        let elBorderTop = $(`<button id="rbro_frame_element_border_top"
                class="rbroButton rbroActionButton rbroIcon-border-top"
                type="button" value="borderTop"
                title="${this.rb.getLabel('orientationTop')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_top',
                        'borderTop', !elBorderTop.hasClass('rbroButtonActive'),
                        SetValueCmd.type.button, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderStyle.append(elBorderTop);
        let elBorderRight = $(`<button id="rbro_frame_element_border_right"
                class="rbroButton rbroActionButton rbroIcon-border-right"
                type="button" value="borderRight"
                title="${this.rb.getLabel('orientationRight')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_right',
                        'borderRight', !elBorderRight.hasClass('rbroButtonActive'),
                        SetValueCmd.type.button, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderStyle.append(elBorderRight);
        let elBorderBottom = $(`<button id="rbro_frame_element_border_bottom"
                class="rbroButton rbroActionButton rbroIcon-border-bottom"
                type="button" value="borderBottom"
                title="${this.rb.getLabel('orientationBottom')}"></button>`)
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_bottom',
                        'borderBottom', !elBorderBottom.hasClass('rbroButtonActive'),
                        SetValueCmd.type.button, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderStyle.append(elBorderBottom);
        elFormField.append(elBorderStyle);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_border_color">${this.rb.getLabel('styleBorderColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBorderColor = $('<input id="rbro_frame_element_border_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_border_color',
                        'borderColor', elBorderColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBorderColorContainer.append(elBorderColor);
        elFormField.append(elBorderColorContainer);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);
        utils.initColorPicker(elBorderColor, this.rb);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_border_width">${this.rb.getLabel('styleBorderWidth')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderWidth = $(`<input id="rbro_frame_element_border_width">`)
            .on('input', event => {
                if (this.rb.getDataObject(this.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(this.getSelectedObjId(), 'rbro_frame_element_border_width',
                        'borderWidth', elBorderWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elBorderWidth);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);
        utils.setInputDecimal(elBorderWidth);
        panel.append(elBorderDiv);

        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_frame_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_frame_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    $('#rbro_frame_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_frame_element_print_section').toggleClass('rbroHidden');
                    elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                    elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(elPrintHeader.position().top);
                    }
                    autosize.update($('#rbro_frame_element_print_if'));
                });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        panel.append(elDiv);
        
        let elPrintSectionDiv = $('<div id="rbro_frame_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_frame_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_frame_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_frame_element_print_if', 'printIf',
                        elPrintIf.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elPrintIf);
        elFormField.append(elPrintIf);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj), this.selectedObjId,
                        'rbro_frame_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_frame_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_remove_empty_element">${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_frame_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_frame_element_remove_empty_element', 'removeEmptyElement',
                        elRemoveEmptyElement.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_frame_element_shrink_to_content_height">${this.rb.getLabel('frameElementShrinkToContentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elShrinkToContentHeight = $(`<input id="rbro_frame_element_shrink_to_content_height" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_frame_element_shrink_to_content_height', 'shrinkToContentHeight',
                        elShrinkToContentHeight.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elShrinkToContentHeight);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);
        
        if (this.rb.getProperty('enableSpreadsheet')) {
            let elSpreadsheetHeader = $('<div class="rbroPanelSectionHeader"></div>');
            let elSpreadsheetHeaderIcon = $('<span id="rbro_frame_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_frame_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        $('#rbro_frame_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                        $('#rbro_frame_element_spreadsheet_section').toggleClass('rbroHidden');
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

            let elSpreadsheetSectionDiv = $('<div id="rbro_frame_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_frame_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_frame_element_spreadsheet_hide">${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_frame_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_frame_element_spreadsheet_hide', 'spreadsheet_hide',
                            elSpreadsheetHide.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_frame_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_frame_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_frame_element_spreadsheet_column">`)
                .on('input', event => {
                    let obj = this.rb.getDataObject(this.selectedObjId);
                    if (obj !== null && obj.getValue('spreadsheet_column') !== elSpreadsheetColumn.val()) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_frame_element_spreadsheet_column', 'spreadsheet_column',
                            elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_frame_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_frame_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_frame_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_frame_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_frame_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
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
        autosize.update($('#rbro_frame_element_print_if'));
    }

    show(data) {
        $('#rbro_frame_element_panel').removeClass('rbroHidden');
        this.updateData(data);
        this.updateAutosizeInputs();
    }

    hide() {
        $('#rbro_frame_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {LineElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_frame_element_label').prop('disabled', false);
            $('#rbro_frame_element_position_x').prop('disabled', false);
            $('#rbro_frame_element_position_y').prop('disabled', false);
            $('#rbro_frame_element_width').prop('disabled', false);
            $('#rbro_frame_element_height').prop('disabled', false);
            $('#rbro_frame_element_background_color').spectrum('enable');
            $('#rbro_frame_element_border_all').prop('disabled', false);
            $('#rbro_frame_element_border_left').prop('disabled', false);
            $('#rbro_frame_element_border_top').prop('disabled', false);
            $('#rbro_frame_element_border_right').prop('disabled', false);
            $('#rbro_frame_element_border_bottom').prop('disabled', false);
            $('#rbro_frame_element_border_color').spectrum('enable');
            $('#rbro_frame_element_border_width').prop('disabled', false);
            $('#rbro_frame_element_print_if').prop('disabled', false);
            $('#rbro_frame_element_remove_empty_element').prop('disabled', false);
            $('#rbro_frame_element_shrink_to_content_height').prop('disabled', false);
            $('#rbro_frame_element_spreadsheet_hide').prop('disabled', false);
            $('#rbro_frame_element_spreadsheet_column').prop('disabled', false);
            $('#rbro_frame_element_spreadsheet_add_empty_row').prop('disabled', false);
            
            $('#rbro_frame_element_label').val(data.getValue('label'));
            $('#rbro_frame_element_position_x').val(data.getValue('x'));
            $('#rbro_frame_element_position_y').val(data.getValue('y'));
            $('#rbro_frame_element_width').val(data.getValue('width'));
            $('#rbro_frame_element_height').val(data.getValue('height'));
            $('#rbro_frame_element_background_color').spectrum("set", data.getValue('backgroundColor'));
            if (data.getValue('borderAll')) {
                $('#rbro_frame_element_border_all').addClass('rbroButtonActive');
            } else {
                $('#rbro_frame_element_border_all').removeClass('rbroButtonActive');
            }
            if (data.getValue('borderLeft')) {
                $('#rbro_frame_element_border_left').addClass('rbroButtonActive');
            } else {
                $('#rbro_frame_element_border_left').removeClass('rbroButtonActive');
            }
            if (data.getValue('borderTop')) {
                $('#rbro_frame_element_border_top').addClass('rbroButtonActive');
            } else {
                $('#rbro_frame_element_border_top').removeClass('rbroButtonActive');
            }
            if (data.getValue('borderRight')) {
                $('#rbro_frame_element_border_right').addClass('rbroButtonActive');
            } else {
                $('#rbro_frame_element_border_right').removeClass('rbroButtonActive');
            }
            if (data.getValue('borderBottom')) {
                $('#rbro_frame_element_border_bottom').addClass('rbroButtonActive');
            } else {
                $('#rbro_frame_element_border_bottom').removeClass('rbroButtonActive');
            }
            $('#rbro_frame_element_border_color').spectrum("set", data.getValue('borderColor'));
            $('#rbro_frame_element_border_width').val(data.getValue('borderWidth'));
            $('#rbro_frame_element_print_if').val(data.getValue('printIf'));
            $('#rbro_frame_element_remove_empty_element').prop('checked', data.getValue('removeEmptyElement'));
            $('#rbro_frame_element_shrink_to_content_height').prop('checked', data.getValue('shrinkToContentHeight'));
            $('#rbro_frame_element_spreadsheet_hide').prop('checked', data.getValue('spreadsheet_hide'));
            $('#rbro_frame_element_spreadsheet_column').val(data.getValue('spreadsheet_column'));
            $('#rbro_frame_element_spreadsheet_add_empty_row').prop('checked', data.getValue('spreadsheet_addEmptyRow'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_frame_element_label').prop('disabled', true);
            $('#rbro_frame_element_position_x').prop('disabled', true);
            $('#rbro_frame_element_position_y').prop('disabled', true);
            $('#rbro_frame_element_width').prop('disabled', true);
            $('#rbro_frame_element_height').prop('disabled', true);
            $('#rbro_frame_element_background_color').spectrum('disable');
            $('#rbro_frame_element_border_all').prop('disabled', true);
            $('#rbro_frame_element_border_left').prop('disabled', true);
            $('#rbro_frame_element_border_top').prop('disabled', true);
            $('#rbro_frame_element_border_right').prop('disabled', true);
            $('#rbro_frame_element_border_bottom').prop('disabled', true);
            $('#rbro_frame_element_border_color').spectrum('disable');
            $('#rbro_frame_element_border_width').prop('disabled', true);
            $('#rbro_frame_element_print_if').prop('disabled', true);
            $('#rbro_frame_element_remove_empty_element').prop('disabled', true);
            $('#rbro_frame_element_shrink_to_content_height').prop('disabled', true);
            $('#rbro_frame_element_spreadsheet_hide').prop('disabled', true);
            $('#rbro_frame_element_spreadsheet_column').prop('disabled', true);
            $('#rbro_frame_element_spreadsheet_add_empty_row').prop('disabled', true);
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
        $('#rbro_frame_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_frame_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_frame_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_frame_element_' + error.field + '_row';
                let errorId = 'rbro_frame_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'print_if') {
                    $('#rbro_frame_element_print_header').addClass('rbroError');
                    if (!$('#rbro_frame_element_print_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_frame_element_print_header').trigger('click');
                    }
                } else if (error.field === 'spreadsheet_column') {
                    $('#rbro_frame_element_spreadsheet_header').addClass('rbroError');
                    if (!$('#rbro_frame_element_spreadsheet_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_frame_element_spreadsheet_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
