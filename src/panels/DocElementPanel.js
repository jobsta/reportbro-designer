import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Generic panel to edit all shared properties of selected document elements.
 * @class
 */
export default class DocElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
    }

    render() {
        let panel = $('<div id="rbro_doc_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_doc_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_x">${this.rb.getLabel('docElementPosition')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_doc_element_x">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('x') !== elPosX.val()) {
                        cmdGroup.addCommand(new SetValueCmd(obj.getId(), 'rbro_doc_element_x', 'x',
                            elPosX.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $('<input id="rbro_doc_element_y">')
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                if (obj !== null && obj.getValue('y') !== elPosY.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_doc_element_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_doc_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_size">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_doc_element_width">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('width') !== elWidth.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_doc_element_width', 'width',
                        elWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_doc_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_doc_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_doc_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_color_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_color">${this.rb.getLabel('docElementColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elColor = $('<input id="rbro_doc_element_color">')
            .change(event => {
                let val = elColor.val();
                if (this.rb.getDataObject(this.selectedObjId) !== null && utils.isValidColor(val)) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_doc_element_color',
                        'color', val, SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elColorContainer.append(elColor);
        elFormField.append(elColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elColor, this.rb);

        elDiv = $('<div id="rbro_doc_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $('<textarea id="rbro_doc_element_print_if" rows="1"></textarea>')
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('printIf') !== elPrintIf.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_doc_element_print_if', 'printIf',
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
                        'rbro_doc_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    updateDisplay() {
        let selectedObjects = this.rb.getSelectedObjects();
        let allProperties = ['x', 'y', 'width', 'height', 'color', 'printIf'];
        let sharedProperties = [];
        let propertyCount = {};
        for (let obj of selectedObjects) {
            let properties = obj.getProperties();
            for (let property of properties) {
                if (property in propertyCount) {
                    propertyCount[property] += 1;
                } else {
                    propertyCount[property] = 0;
                }
            }
        }
        for (let property in propertyCount) {
            if (propertyCount[property] === selectedObjects.length) {
                sharedProperties.push(property);
            }
        }

        // show/hide property depending if it is available in all selected objects
        for (let property of allProperties) {
            let propertyId = `#rbro_doc_element_${property}_row`;
            if (property in sharedProperties) {
                $(propertyId).removeClass('rbroHidden');
            } else {
                $(propertyId).addClass('rbroHidden');
            }
        }

        this.updateAutosizeInputs();
    }

    static updateAutosizeInputs() {
        autosize.update($('#rbro_doc_element_print_if'));
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
    updateErrors(errors, displayedObjectId) {
        $('#rbro_doc_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_doc_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_doc_element_panel .rbroErrorMessage').text('');

        for (let error of errors) {
            if (error.object_id === displayedObjectId) {
                let rowId = 'rbro_line_element_' + error.field + '_row';
                let errorId = 'rbro_line_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' +
                        error.info.replace('<', '&lt;').replace('>', '&gt;') + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
            }
        }
    }

    /**
     * Is called when the selected element was changed.
     */
    selectionChanged() {
        this.updateDisplay();
    }
}
