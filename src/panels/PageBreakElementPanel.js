import SetValueCmd from '../commands/SetValueCmd';
import * as utils from '../utils';

/**
 * Panel to edit all page break properties.
 * @class
 */
export default class PageBreakElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_page_break_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_page_break_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_page_break_element_position_y">${this.rb.getLabel('docElementPositionY')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elPosY = $(`<input id="rbro_page_break_element_position_y">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_page_break_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    show(data) {
        $('#rbro_page_break_element_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_page_break_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {PageBreakElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_page_break_element_position_y').prop('disabled', false);
            $('#rbro_page_break_element_position_y').val(data.getValue('y'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_page_break_element_position_y').prop('disabled', true);
        }
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
        $('#rbro_page_break_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_page_break_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
