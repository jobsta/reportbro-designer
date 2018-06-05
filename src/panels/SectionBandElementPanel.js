import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import * as utils from '../utils';
import Band from '../container/Band';

/**
 * Panel to edit all band properties of custom section.
 * @class
 */
export default class SectionBandElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_section_band_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_section_band_element_height">${this.rb.getLabel('docElementHeight')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elHeight = $('<input id="rbro_section_band_element_height">')
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_section_band_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_section_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div id="rbro_section_band_element_repeat_header_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_section_band_element_repeat_header">${this.rb.getLabel('tableElementRepeatHeader')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRepeatHeader = $('<input id="rbro_section_band_element_repeat_header" type="checkbox">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_section_band_element_repeat_header', 'repeatHeader',
                        elRepeatHeader.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRepeatHeader);
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div id="rbro_section_band_element_always_print_on_same_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_section_band_element_always_print_on_same_page">${this.rb.getLabel('docElementAlwaysPrintOnSamePage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAlwaysPrintOnSamePage = $(`<input id="rbro_section_band_element_always_print_on_same_page" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_section_band_element_always_print_on_same_page', 'alwaysPrintOnSamePage',
                        elAlwaysPrintOnSamePage.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elAlwaysPrintOnSamePage);
        elFormField.append('<div id="rbro_section_band_element_always_print_on_same_page_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_section_band_element_shrink_to_content_height">${this.rb.getLabel('frameElementShrinkToContentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elShrinkToContentHeight = $(`<input id="rbro_section_band_element_shrink_to_content_height" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_section_band_element_shrink_to_content_height', 'shrinkToContentHeight',
                        elShrinkToContentHeight.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elShrinkToContentHeight);
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    show(data) {
        $('#rbro_section_band_element_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_section_band_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {TableBandElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_section_band_element_height').prop('disabled', false);
            $('#rbro_section_band_element_repeat_header').prop('disabled', false);
            $('#rbro_section_band_shrink_to_content_height').prop('disabled', false);

            $('#rbro_section_band_element_height').val(data.getValue('height'));
            if (data.getValue('bandType') === Band.bandType.header) {
                $('#rbro_section_band_element_repeat_header').prop('checked', data.getValue('repeatHeader'));
                $('#rbro_section_band_element_repeat_header_row').show();
                $('#rbro_section_band_element_always_print_on_same_page_row').hide();
            } else {
                $('#rbro_section_band_element_repeat_header_row').hide();
                $('#rbro_section_band_element_always_print_on_same_page').prop(
                    'checked', data.getValue('alwaysPrintOnSamePage'));
                $('#rbro_section_band_element_always_print_on_same_page_row').show();
            }
            $('#rbro_section_band_shrink_to_content_height').prop('checked', data.getValue('shrinkToContentHeight'));
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_section_band_element_height').prop('disabled', true);
            $('#rbro_section_band_element_repeat_header').prop('disabled', true);
            $('#rbro_section_band_shrink_to_content_height').prop('disabled', true);
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
        $('#rbro_section_band_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_section_band_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_section_band_element_' + error.field + '_row';
                let errorId = 'rbro_section_band_element_' + error.field + '_error';
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
