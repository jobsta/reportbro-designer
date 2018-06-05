import SetValueCmd from '../commands/SetValueCmd';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all line properties.
 * @class
 */
export default class LineElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_line_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_line_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_line_element_position">${this.rb.getLabel('docElementPosition')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_line_element_position_x">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('x') !== elPosX.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_line_element_position_x', 'x',
                        elPosX.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_line_element_position_y">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('y') !== elPosY.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_line_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_line_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_line_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_line_element_size">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_line_element_width">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('width') !== elWidth.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_line_element_width', 'width',
                        elWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_line_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_line_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_line_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_line_element_color">${this.rb.getLabel('docElementColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elColor = $('<input id="rbro_line_element_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_line_element_color',
                        'color', elColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elColorContainer.append(elColor);
        elFormField.append(elColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elColor, this.rb);

        elDiv = $('<div id="rbro_line_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_line_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_line_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('printIf') !== elPrintIf.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_line_element_print_if', 'printIf',
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
                        'rbro_line_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_line_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    updateAutosizeInputs() {
        autosize.update($('#rbro_line_element_print_if'));
    }

    show(data) {
        $('#rbro_line_element_panel').removeClass('rbroHidden');
        this.updateData(data);
        this.updateAutosizeInputs();
    }

    hide() {
        $('#rbro_line_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {LineElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_line_element_position_x').prop('disabled', false);
            $('#rbro_line_element_position_y').prop('disabled', false);
            $('#rbro_line_element_width').prop('disabled', false);
            $('#rbro_line_element_height').prop('disabled', false);
            $('#rbro_line_element_color').spectrum('enable');
            $('#rbro_line_element_print_if').prop('disabled', false);

            $('#rbro_line_element_position_x').val(data.getValue('x'));
            $('#rbro_line_element_position_y').val(data.getValue('y'));
            $('#rbro_line_element_width').val(data.getValue('width'));
            $('#rbro_line_element_height').val(data.getValue('height'));
            $('#rbro_line_element_color').spectrum("set", data.getValue('color'));
            $('#rbro_line_element_print_if').val(data.getValue('printIf'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_line_element_position_x').prop('disabled', true);
            $('#rbro_line_element_position_y').prop('disabled', true);
            $('#rbro_line_element_width').prop('disabled', true);
            $('#rbro_line_element_height').prop('disabled', true);
            $('#rbro_line_element_color').spectrum('disable');
            $('#rbro_line_element_print_if').prop('disabled', true);
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
        $('#rbro_line_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_line_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_line_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_line_element_' + error.field + '_row';
                let errorId = 'rbro_line_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
