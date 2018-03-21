import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all band properties.
 * @class
 */
export default class BandElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_band_element_panel" class="rbroHidden"></div>');

        let elDiv = $('<div class="rbroFormRow" id="rbro_band_element_data_source_row"></div>');
        elDiv.append(`<label for="rbro_band_element_data_source">${this.rb.getLabel('docElementDataSource')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elDataSource = $(`<textarea id="rbro_band_element_data_source" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_band_element_data_source', 'dataSource',
                        elDataSource.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            })
            .focus(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj, [Parameter.type.array]),
                        this.selectedObjId, 'rbro_band_element_data_source', 'dataSource',
                        PopupWindow.type.parameterSet);
                }
            })
            .blur(event => {
                this.rb.getPopupWindow().hide();
            })
            .mouseup(event => {
                event.preventDefault();
                event.stopPropagation();
            });
        autosize(elDataSource);
        elFormField.append(elDataSource);
        elFormField.append('<div id="rbro_band_element_data_source_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_band_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_band_element_position_y">${this.rb.getLabel('docElementPositionY')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elPosY = $(`<input id="rbro_band_element_position_y">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_band_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_band_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_band_element_width">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHeight = $(`<input id="rbro_band_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_band_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_band_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_band_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_band_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    $('#rbro_band_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_band_element_print_section').toggleClass('rbroHidden');
                    elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                    elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(elPrintHeader.position().top);
                    }
                    autosize.update($('#rbro_band_element_print_if'));
                });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        panel.append(elDiv);
        
        let elPrintSectionDiv = $('<div id="rbro_band_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_band_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_band_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPrintIf = $(`<textarea id="rbro_band_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_band_element_print_if', 'printIf',
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
                        'rbro_band_element_print_if', 'parameter', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_band_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_band_element_remove_empty_element">${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_band_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_band_element_remove_empty_element', 'removeEmptyElement',
                        elRemoveEmptyElement.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_band_element_shrink_to_content_height">${this.rb.getLabel('frameElementShrinkToContentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elShrinkToContentHeight = $(`<input id="rbro_band_element_shrink_to_content_height" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_band_element_shrink_to_content_height', 'shrinkToContentHeight',
                        elShrinkToContentHeight.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elShrinkToContentHeight);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);

        $('#rbro_detail_panel').append(panel);
    }

    updateAutosizeInputs() {
        autosize.update($('#rbro_band_element_print_if'));
    }

    show(data) {
        $('#rbro_band_element_panel').removeClass('rbroHidden');
        this.updateData(data);
        this.updateAutosizeInputs();
    }

    hide() {
        $('#rbro_band_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {LineElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_band_element_data_source').prop('disabled', false);
            $('#rbro_band_element_label').prop('disabled', false);
            $('#rbro_band_element_position_y').prop('disabled', false);
            $('#rbro_band_element_height').prop('disabled', false);
            $('#rbro_band_element_print_if').prop('disabled', false);
            $('#rbro_band_element_remove_empty_element').prop('disabled', false);
            $('#rbro_band_element_shrink_to_content_height').prop('disabled', false);
            
            $('#rbro_band_element_data_source').val(data.getValue('dataSource'));
            $('#rbro_band_element_label').val(data.getValue('label'));
            $('#rbro_band_element_position_y').val(data.getValue('y'));
            $('#rbro_band_element_height').val(data.getValue('height'));
            $('#rbro_band_element_print_if').val(data.getValue('printIf'));
            $('#rbro_band_element_remove_empty_element').prop('checked', data.getValue('removeEmptyElement'));
            $('#rbro_band_element_shrink_to_content_height').prop('checked', data.getValue('shrinkToContentHeight'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_band_element_data_source').prop('disabled', true);
            $('#rbro_band_element_label').prop('disabled', true);
            $('#rbro_band_element_position_y').prop('disabled', true);
            $('#rbro_band_element_height').prop('disabled', true);
            $('#rbro_band_element_print_if').prop('disabled', true);
            $('#rbro_band_element_remove_empty_element').prop('disabled', true);
            $('#rbro_band_element_shrink_to_content_height').prop('disabled', true);
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
        $('#rbro_band_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_band_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_band_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_band_element_' + error.field + '_row';
                let errorId = 'rbro_band_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'print_if') {
                    $('#rbro_band_element_print_header').addClass('rbroError');
                    if (!$('#rbro_band_element_print_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_band_element_print_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
