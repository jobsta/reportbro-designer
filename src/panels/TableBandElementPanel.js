import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import * as utils from '../utils';

/**
 * Panel to edit all table band properties.
 * @class
 */
export default class TableBandElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_table_band_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_band_element_width">${this.rb.getLabel('docElementHeight')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elHeight = $('<input id="rbro_table_band_element_height">')
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_band_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div id="rbro_table_band_element_repeat_header_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_band_element_repeat_header">${this.rb.getLabel('tableElementRepeatHeader')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRepeatHeader = $('<input id="rbro_table_band_element_repeat_header" type="checkbox">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_table_band_element_repeat_header', 'repeatHeader',
                        elRepeatHeader.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRepeatHeader);
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_band_element_background_color">${this.rb.getLabel('styleBackgroundColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBgColor = $('<input id="rbro_table_band_element_background_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_band_element_background_color',
                        'backgroundColor', elBgColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elBgColorContainer.append(elBgColor);
        elFormField.append(elBgColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elBgColor, this.rb, { allowEmpty: true });

        elDiv = $('<div id="rbro_table_band_element_alternate_background_color_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_band_element_alternate_background_color">${this.rb.getLabel('tableElementAlternateBackgroundColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAltBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elAltBgColor = $('<input id="rbro_table_band_element_alternate_background_color">')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_table_band_element_alternate_background_color',
                        'alternateBackgroundColor', elAltBgColor.val(), SetValueCmd.type.color, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elAltBgColorContainer.append(elAltBgColor);
        elFormField.append(elAltBgColorContainer);
        elDiv.append(elFormField);
        panel.append(elDiv);
        utils.initColorPicker(elAltBgColor, this.rb, { allowEmpty: true });

        elDiv = $('<div id="rbro_table_band_element_always_print_on_same_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_table_band_element_always_print_on_same_page">${this.rb.getLabel('docElementAlwaysPrintOnSamePage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAlwaysPrintOnSamePage = $(`<input id="rbro_table_band_element_always_print_on_same_page" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_table_band_element_always_print_on_same_page', 'alwaysPrintOnSamePage',
                        elAlwaysPrintOnSamePage.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elAlwaysPrintOnSamePage);
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);
    }

    show(data) {
        $('#rbro_table_band_element_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_table_band_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {TableBandElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_table_band_element_height').prop('disabled', false);
            $('#rbro_table_band_element_repeat_header').prop('disabled', false);

            $('#rbro_table_band_element_height').val(data.getValue('height'));
            $('#rbro_table_band_element_background_color').spectrum("set", data.getValue('backgroundColor'));
            if (data.getValue('tableBand') === 'header') {
                $('#rbro_table_band_element_repeat_header').prop('checked', data.getValue('repeatHeader'));
                $('#rbro_table_band_element_repeat_header_row').show();
            } else {
                $('#rbro_table_band_element_repeat_header_row').hide();
            }
            if (data.getValue('tableBand') === 'content') {
                $('#rbro_table_band_element_alternate_background_color').spectrum("set", data.getValue('alternateBackgroundColor'));
                $('#rbro_table_band_element_always_print_on_same_page').prop('checked', data.getValue('alwaysPrintOnSamePage'));
                $('#rbro_table_band_element_alternate_background_color_row').show();
                $('#rbro_table_band_element_always_print_on_same_page_row').show();
            } else {
                $('#rbro_table_band_element_alternate_background_color_row').hide();
                $('#rbro_table_band_element_always_print_on_same_page_row').hide();
            }
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_table_band_element_height').prop('disabled', true);
            $('#rbro_table_band_element_repeat_header').prop('disabled', true);
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
        $('#rbro_table_band_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_table_band_element_panel .rbroErrorMessage').text('');
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
