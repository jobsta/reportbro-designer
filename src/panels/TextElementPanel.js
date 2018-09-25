import StylePanel from './StylePanel';
import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import Band from '../container/Band';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import TableTextElement from '../elements/TableTextElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Panel to edit all text properties.
 * @class
 */
export default class TextElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.elStyle = null;
        this.cs_elStyle = null;
        this.selectedObjId = null;
    }

    render() {
        let panel = $('<div id="rbro_text_element_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_text_element_content_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_content">${this.rb.getLabel('textElementContent')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elContent = $(`<textarea id="rbro_text_element_content" rows="1"></textarea>`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('content') !== elContent.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_content', 'content',
                        elContent.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            })
            .blur(event => {
                this.rb.getPopupWindow().hide();
            });
        autosize(elContent);
        elFormField.append(elContent);
        let elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj), this.selectedObjId,
                        'rbro_text_element_content', 'content', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_text_element_content_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow" id="rbro_text_element_eval_row"></div>');
        elDiv.append(`<label for="rbro_text_element_eval">${this.rb.getLabel('textElementEval')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elEval = $(`<input id="rbro_text_element_eval" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_eval', 'eval',
                        elEval.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elEval);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_text_element_position_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_position_x">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_text_element_position_x">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('x') !== elPosX.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_position_x', 'x',
                        elPosX.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $(`<input id="rbro_text_element_position_y">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('y') !== elPosY.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_position_y', 'y',
                        elPosY.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_text_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);
        
        elDiv = $('<div id="rbro_text_element_size_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_size">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_text_element_width">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('width') !== elWidth.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_width', 'width',
                        elWidth.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_text_element_height">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('height') !== elHeight.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_height', 'height',
                        elHeight.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_text_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        let elStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elStyleHeaderIcon = $('<span id="rbro_text_element_style_header_icon" class="rbroPanelSectionHeaderOpen rbroIcon-minus"></span>');
        elDiv = $('<div id="rbro_text_element_style_header" class="rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen"></div>')
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    $('#rbro_text_element_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_text_element_style_section').toggleClass('rbroHidden');
                    elStyleHeaderIcon.toggleClass('rbroIcon-plus');
                    elStyleHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop($('#rbro_detail_panel').scrollTop() + elStyleHeader.position().top);
                    }
                }
            });
        elStyleHeader.append(elStyleHeaderIcon);
        elStyleHeader.append(`<span>${this.rb.getLabel('docElementStyle')}</span>`);
        elDiv.append(elStyleHeader);
        panel.append(elDiv);

        let elStyleSectionDiv = $('<div id="rbro_text_element_style_section"></div>');
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        this.elStyle = $('<select id="rbro_text_element_style_id"></select>')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_style_id', 'styleId',
                        this.elStyle.val(), SetValueCmd.type.select, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(this.elStyle);
        elDiv.append(elFormField);
        elStyleSectionDiv.append(elDiv);

        let elStyleDiv = $('<div id="rbro_text_element_style_settings"></div>');
        StylePanel.renderStyle(elStyleDiv, 'text_element_', '', DocElement.type.text, this, this.rb);
        elStyleSectionDiv.append(elStyleDiv);
        panel.append(elStyleSectionDiv);

        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_text_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_text_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    $('#rbro_text_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_text_element_print_section').toggleClass('rbroHidden');
                    elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                    elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop($('#rbro_detail_panel').scrollTop() + elPrintHeader.position().top);
                    }
                    autosize.update($('#rbro_text_element_print_if'));
                }
            });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        panel.append(elDiv);

        let elPrintSectionDiv = $('<div id="rbro_text_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_text_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_text_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('printIf') !== elPrintIf.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_print_if', 'printIf',
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
                        'rbro_text_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_text_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_text_element_remove_empty_element_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_remove_empty_element">${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_text_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_remove_empty_element', 'removeEmptyElement',
                        elRemoveEmptyElement.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);

        elDiv = $('<div id="rbro_text_element_always_print_on_same_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_always_print_on_same_page">${this.rb.getLabel('docElementAlwaysPrintOnSamePage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAlwaysPrintOnSamePage = $(`<input id="rbro_text_element_always_print_on_same_page" type="checkbox">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_always_print_on_same_page', 'alwaysPrintOnSamePage',
                        elAlwaysPrintOnSamePage.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elAlwaysPrintOnSamePage);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_pattern">${this.rb.getLabel('textElementPattern')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPattern = $(`<input id="rbro_text_element_pattern">`)
            .on('input', event => {
                let obj = this.rb.getDataObject(this.selectedObjId);
                if (obj !== null && obj.getValue('pattern') !== elPattern.val()) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_pattern', 'pattern',
                        elPattern.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(elPattern);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getPatterns(), this.selectedObjId,
                        'rbro_text_element_pattern', 'pattern', PopupWindow.type.pattern);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_text_element_pattern_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        panel.append(elPrintSectionDiv);

        let elConditionalStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elConditionalStyleHeaderIcon = $('<span id="rbro_text_element_cs_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_text_element_cs_header" class="rbroFormRow rbroPanelSection"></div>')
            .click(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    $('#rbro_text_element_cs_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_text_element_cs_section').toggleClass('rbroHidden');
                    elConditionalStyleHeaderIcon.toggleClass('rbroIcon-plus');
                    elConditionalStyleHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elConditionalStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop($('#rbro_detail_panel').scrollTop() + elConditionalStyleHeader.position().top);
                    }
                    autosize.update($('#rbro_text_element_cs_condition'));
                }
            });
        elConditionalStyleHeader.append(elConditionalStyleHeaderIcon);
        elConditionalStyleHeader.append(`<span>${this.rb.getLabel('docElementConditionalStyle')}</span>`);
        elDiv.append(elConditionalStyleHeader);
        panel.append(elDiv);

        let elCondStyleSectionDiv = $('<div id="rbro_text_element_cs_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_text_element_cs_condition_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_cs_condition">${this.rb.getLabel('docElementConditionalStyleCondition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elCondStyleCondition = $(`<textarea id="rbro_text_element_cs_condition" rows="1"></textarea>`)
            .on('input', event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId,
                        'rbro_text_element_cs_condition', 'cs_condition',
                        elCondStyleCondition.val(), SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        autosize(elCondStyleCondition);
        elFormField.append(elCondStyleCondition);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    this.rb.getPopupWindow().show(this.rb.getParameterItems(selectedObj), this.selectedObjId,
                        'rbro_text_element_cs_condition', 'cs_condition', PopupWindow.type.parameterAppend);
                }
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_text_element_cs_condition_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elCondStyleSectionDiv.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_text_element_cs_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        this.cs_elStyle = $('<select id="rbro_text_element_cs_style_id"></select>')
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    let cmd = new SetValueCmd(this.selectedObjId, `rbro_text_element_cs_style_id`, 'cs_styleId',
                        this.cs_elStyle.val(), SetValueCmd.type.select, this.rb);
                    this.rb.executeCommand(cmd);
                }
            });
        elFormField.append(this.cs_elStyle);
        elDiv.append(elFormField);
        elCondStyleSectionDiv.append(elDiv);
        
        let elCondStyleDiv = $('<div id="rbro_text_element_cs_style_settings"></div>');
        StylePanel.renderStyle(elCondStyleDiv, 'text_element_cs_', 'cs_', DocElement.type.text, this, this.rb);
        elCondStyleSectionDiv.append(elCondStyleDiv);
        panel.append(elCondStyleSectionDiv);

        if (this.rb.getProperty('enableSpreadsheet')) {
            let elSpreadsheetHeader = $('<div class="rbroPanelSectionHeader"></div>');
            let elSpreadsheetHeaderIcon = $('<span id="rbro_text_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_text_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        $('#rbro_text_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                        $('#rbro_text_element_spreadsheet_section').toggleClass('rbroHidden');
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

            let elSpreadsheetSectionDiv = $('<div id="rbro_text_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_text_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_text_element_spreadsheet_hide">${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_text_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_text_element_spreadsheet_hide', 'spreadsheet_hide',
                            elSpreadsheetHide.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_text_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_text_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_text_element_spreadsheet_column">`)
                .on('input', event => {
                    let obj = this.rb.getDataObject(this.selectedObjId);
                    if (obj !== null && obj.getValue('spreadsheet_column') !== elSpreadsheetColumn.val()) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_spreadsheet_column', 'spreadsheet_column',
                            elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_text_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_text_element_spreadsheet_colspan_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_text_element_spreadsheet_colspan">${this.rb.getLabel('docElementSpreadsheetColspan')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColspan = $(`<input id="rbro_text_element_spreadsheet_colspan">`)
                .on('input', event => {
                    let obj = this.rb.getDataObject(this.selectedObjId);
                    if (obj !== null && obj.getValue('spreadsheet_colspan') !== elSpreadsheetColspan.val()) {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_text_element_spreadsheet_colspan', 'spreadsheet_colspan',
                            elSpreadsheetColspan.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColspan);
            elFormField.append(elSpreadsheetColspan);
            elFormField.append('<div id="rbro_text_element_spreadsheet_colspan_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_text_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_text_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_text_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    if (this.rb.getDataObject(this.selectedObjId) !== null) {
                        let cmd = new SetValueCmd(this.selectedObjId,
                            'rbro_text_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
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
        this.renderStyleSelect();
    }

    renderStyleSelect() {
        this.elStyle.empty();
        this.cs_elStyle.empty();
        this.elStyle.append(`<option value="">${this.rb.getLabel('styleNone')}</option>`);
        this.cs_elStyle.append(`<option value="">${this.rb.getLabel('styleNone')}</option>`);
        let styles = this.rb.getStyles();
        for (let style of styles) {
            this.elStyle.append(`<option value="${style.getId()}">${style.getName()}</option>`);
            this.cs_elStyle.append(`<option value="${style.getId()}">${style.getName()}</option>`);
        }
    }

    updateAutosizeInputs() {
        autosize.update($('#rbro_text_element_content'));
        autosize.update($('#rbro_text_element_print_if'));
        autosize.update($('#rbro_text_element_cs_condition'));
    }

    show(data) {
        $('#rbro_text_element_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_text_element_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {TextElement|TableTextElement} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_text_element_content').prop('disabled', false);
            $('#rbro_text_element_eval').prop('disabled', false);
            $('#rbro_text_element_position_x').prop('disabled', false);
            $('#rbro_text_element_position_y').prop('disabled', false);
            $('#rbro_text_element_width').prop('disabled', false);
            $('#rbro_text_element_height').prop('disabled', false);
            $('#rbro_text_element_print_if').prop('disabled', false);
            $('#rbro_text_element_remove_empty_element').prop('disabled', false);
            $('#rbro_text_element_always_print_on_same_page').prop('disabled', false);
            $('#rbro_text_element_pattern').prop('disabled', false);
            $('#rbro_text_element_cs_condition').prop('disabled', false);
            $('#rbro_text_element_style_id').prop('disabled', false);
            $('#rbro_text_element_spreadsheet_hide').prop('disabled', false);
            $('#rbro_text_element_spreadsheet_column').prop('disabled', false);
            $('#rbro_text_element_spreadsheet_colspan').prop('disabled', false);
            $('#rbro_text_element_spreadsheet_add_empty_row').prop('disabled', false);

            $('#rbro_text_element_content').val(data.getValue('content'));
            $('#rbro_text_element_eval').prop('checked', data.getValue('eval'));
            $('#rbro_text_element_width').val(data.getValue('width'));
            $('#rbro_text_element_height').val(data.getValue('height'));
            $('#rbro_text_element_print_if').val(data.getValue('printIf'));
            $('#rbro_text_element_pattern').val(data.getValue('pattern'));
            if (!(data instanceof TableTextElement)) {
                $('#rbro_text_element_position_x').val(data.getValue('x'));
                $('#rbro_text_element_position_y').val(data.getValue('y'));
                $('#rbro_text_element_remove_empty_element').prop('checked', data.getValue('removeEmptyElement'));
                $('#rbro_text_element_always_print_on_same_page').prop('checked', data.getValue('alwaysPrintOnSamePage'));
                $('#rbro_text_element_spreadsheet_hide').prop('checked', data.getValue('spreadsheet_hide'));
                $('#rbro_text_element_spreadsheet_column').val(data.getValue('spreadsheet_column'));
                $('#rbro_text_element_spreadsheet_colspan').val(data.getValue('spreadsheet_colspan'));
                $('#rbro_text_element_spreadsheet_add_empty_row').prop('checked', data.getValue('spreadsheet_addEmptyRow'));
                $('#rbro_text_element_print_if_row').show();
                $('#rbro_text_element_remove_empty_element_row').show();
                $('#rbro_text_element_always_print_on_same_page_row').show();
                $('#rbro_text_element_spreadsheet_hide').show();
                $('#rbro_text_element_spreadsheet_column').show();
                $('#rbro_text_element_spreadsheet_colspan').show();
                $('#rbro_text_element_spreadsheet_header').show();
                $('#rbro_text_element_spreadsheet_section').show();
            } else {
                $('#rbro_text_element_position_x').val(data.getOffsetX());
                $('#rbro_text_element_remove_empty_element_row').hide();
                $('#rbro_text_element_always_print_on_same_page_row').hide();
                let tableBandObj = this.rb.getDataObject(data.parentId);
                if (tableBandObj !== null && tableBandObj.getValue('bandType') === Band.bandType.header) {
                    $('#rbro_text_element_print_if_row').show();
                } else {
                    $('#rbro_text_element_print_if_row').hide();
                }
                $('#rbro_text_element_spreadsheet_hide').hide();
                $('#rbro_text_element_spreadsheet_column').hide();
                $('#rbro_text_element_spreadsheet_colspan').hide();
                $('#rbro_text_element_spreadsheet_header').hide();
                $('#rbro_text_element_spreadsheet_section').hide();
            }
            $('#rbro_text_element_cs_condition').val(data.getValue('cs_condition'));

            $('#rbro_text_element_style_id').val(data.getValue('styleId'));
            if (data.getValue('styleId') !== '') {
                $('#rbro_text_element_style_settings').hide();
            } else {
                $('#rbro_text_element_style_settings').show();
            }
            $('#rbro_text_element_cs_style_id').val(data.getValue('cs_styleId'));
            if (data.getValue('cs_styleId') != '') {
                $('#rbro_text_element_cs_style_settings').hide();
            } else {
                $('#rbro_text_element_cs_style_settings').show();
            }
            if (data.getXTagId() !== '') {
                $('#rbro_text_element_position_row label').text(this.rb.getLabel('docElementPosition') + ':');
                $('#rbro_text_element_position_row label').removeClass('rbroDisabled');
                $('#rbro_text_element_position_x').prop('disabled', false);
            } else {
                $('#rbro_text_element_position_row label').text(this.rb.getLabel('docElementPositionX') + ':');
                $('#rbro_text_element_position_row label').addClass('rbroDisabled');
                $('#rbro_text_element_position_x').prop('disabled', true);
            }
            if (data.getYTagId() !== '') {
                $('#rbro_text_element_position_y').show();
            } else {
                $('#rbro_text_element_position_y').hide();
            }
            if (data.getHeightTagId() !== '') {
                $('#rbro_text_element_size_row label').text(this.rb.getLabel('docElementSize') + ':');
                $('#rbro_text_element_height').show();
            } else {
                $('#rbro_text_element_size_row label').text(this.rb.getLabel('docElementWidth') + ':');
                $('#rbro_text_element_height').hide();
            }
            if (data.hasBorderSettings()) {
                $('#rbro_text_element_border_div').show();
                $('#rbro_text_element_cs_border_div').show();
            } else {
                $('#rbro_text_element_border_div').hide();
                $('#rbro_text_element_cs_border_div').hide();
            }
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_text_element_content').prop('disabled', true);
            $('#rbro_text_element_eval').prop('disabled', true);
            $('#rbro_text_element_position_x').prop('disabled', true);
            $('#rbro_text_element_position_y').prop('disabled', true);
            $('#rbro_text_element_width').prop('disabled', true);
            $('#rbro_text_element_height').prop('disabled', true);
            $('#rbro_text_element_print_if').prop('disabled', true);
            $('#rbro_text_element_remove_empty_element').prop('disabled', true);
            $('#rbro_text_element_always_print_on_same_page').prop('disabled', true);
            $('#rbro_text_element_pattern').prop('disabled', false);
            $('#rbro_text_element_cs_condition').prop('disabled', true);
            $('#rbro_text_element_style_id').prop('disabled', true);
            $('#rbro_text_element_spreadsheet_hide').prop('disabled', true);
            $('#rbro_text_element_spreadsheet_column').prop('disabled', true);
            $('#rbro_text_element_spreadsheet_colspan').prop('disabled', true);
            $('#rbro_text_element_spreadsheet_add_empty_row').prop('disabled', true);
            this.selectedObjId = null;
        }
        StylePanel.updateStyleData(data, 'text_element_', '', DocElement.type.text);
        StylePanel.updateStyleData(data, 'text_element_cs_', 'cs_', DocElement.type.text);

        this.updateAutosizeInputs();
        this.updateErrors();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     */
    notifyEvent(obj, operation) {
        if (obj instanceof Style) {
            if (operation === Command.operation.add || operation === Command.operation.move) {
                this.renderStyleSelect();
                let selectedObj = this.rb.getDataObject(this.selectedObjId);
                if (selectedObj !== null) {
                    $('#rbro_text_element_style_id').val(selectedObj.getValue('styleId'));
                    $('#rbro_text_element_cs_style_id').val(selectedObj.getValue('cs_styleId'));
                }
            } else if (operation === Command.operation.remove) {
                this.elStyle.find(`option[value='${obj.getId()}']`).remove();
                this.cs_elStyle.find(`option[value='${obj.getId()}']`).remove();
            } else if (operation === Command.operation.rename) {
                this.elStyle.find(`option[value='${obj.getId()}']`).text(obj.getName());
                this.cs_elStyle.find(`option[value='${obj.getId()}']`).text(obj.getName());
            }
            if ($('#rbro_text_element_style_id').val() === '') {
                $('#rbro_text_element_style_settings').show();
            } else {
                $('#rbro_text_element_style_settings').hide();
            }
            if ($('#rbro_text_element_cs_style_id').val() === '') {
                $('#rbro_text_element_cs_style_settings').show();
            } else {
                $('#rbro_text_element_cs_style_settings').hide();
            }
        }
    }

    /**
     * Updates displayed errors of currently selected data object.
     */
    updateErrors() {
        $('#rbro_text_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_text_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_text_element_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
                let rowId = 'rbro_text_element_' + error.field + '_row';
                let errorId = 'rbro_text_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
                if (error.field === 'print_if' || error.field === 'pattern') {
                    $('#rbro_text_element_print_header').addClass('rbroError');
                    if (!$('#rbro_text_element_print_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_text_element_print_header').trigger('click');
                    }
                } else if (error.field === 'cs_condition') {
                    $('#rbro_text_element_cs_header').addClass('rbroError');
                    if (!$('#rbro_text_element_cs_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_text_element_cs_header').trigger('click');
                    }
                } else if (error.field === 'spreadsheet_column' || error.field === 'spreadsheet_colspan') {
                    $('#rbro_text_element_spreadsheet_header').addClass('rbroError');
                    if (!$('#rbro_text_element_spreadsheet_header').hasClass('rbroPanelSectionHeaderOpen')) {
                        $('#rbro_text_element_spreadsheet_header').trigger('click');
                    }
                }
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
